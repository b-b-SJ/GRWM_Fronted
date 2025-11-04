import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * StudyRoomWebSocketContext
 * - 스터디룸 전용 WebSocket 연결 및 STOMP 프로토콜 처리
 * - To-do 실시간 동기화 (생성/수정/삭제/완료)
 * - 리액션 실시간 업데이트
 * - 연장 투표 실시간 동기화
 * - 참여자 입장/퇴장 알림
 */

const StudyRoomWebSocketContext = createContext();

// STOMP 메시지 파싱 유틸리티
const parseStompMessage = (data) => {
    try {
        const lines = data.split('\n');
        const headerEndIndex = lines.findIndex(line => line === '');

        if (headerEndIndex === -1) {
            console.error('잘못된 STOMP 메시지 형식');
            return null;
        }

        const bodyLines = lines.slice(headerEndIndex + 1);
        const messageBody = bodyLines.join('\n').replace(/\0$/, '');

        return messageBody ? JSON.parse(messageBody) : null;
    } catch (error) {
        console.error('STOMP 메시지 파싱 오류:', error);
        return null;
    }
};

export const StudyRoomWebSocketProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();

    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [currentStudyRoomId, setCurrentStudyRoomId] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const websocketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const todoHandlersRef = useRef([]);
    const reactionHandlersRef = useRef([]);
    const voteHandlersRef = useRef([]);
    const roomHandlersRef = useRef([]);
    const isConnectingRef = useRef(false);
    const subscriptionIdsRef = useRef([]);
    const heartbeatIntervalRef = useRef(null);

    // To-do 이벤트 핸들러 등록
    const addTodoHandler = useCallback((handler) => {
        todoHandlersRef.current.push(handler);
        return () => {
            todoHandlersRef.current = todoHandlersRef.current.filter(h => h !== handler);
        };
    }, []);

    // 리액션 이벤트 핸들러 등록
    const addReactionHandler = useCallback((handler) => {
        reactionHandlersRef.current.push(handler);
        return () => {
            reactionHandlersRef.current = reactionHandlersRef.current.filter(h => h !== handler);
        };
    }, []);

    // 투표 이벤트 핸들러 등록
    const addVoteHandler = useCallback((handler) => {
        voteHandlersRef.current.push(handler);
        return () => {
            voteHandlersRef.current = voteHandlersRef.current.filter(h => h !== handler);
        };
    }, []);

    // 스터디룸 이벤트 핸들러 등록 (입장/퇴장/종료)
    const addRoomHandler = useCallback((handler) => {
        roomHandlersRef.current.push(handler);
        return () => {
            roomHandlersRef.current = roomHandlersRef.current.filter(h => h !== handler);
        };
    }, []);

    // 핸들러 알림 함수들
    const notifyTodoHandlers = useCallback((event) => {
        todoHandlersRef.current.forEach(handler => {
            try {
                handler(event);
            } catch (error) {
                console.error('Todo 핸들러 오류:', error);
            }
        });
    }, []);

    const notifyReactionHandlers = useCallback((event) => {
        reactionHandlersRef.current.forEach(handler => {
            try {
                handler(event);
            } catch (error) {
                console.error('리액션 핸들러 오류:', error);
            }
        });
    }, []);

    const notifyVoteHandlers = useCallback((event) => {
        voteHandlersRef.current.forEach(handler => {
            try {
                handler(event);
            } catch (error) {
                console.error('투표 핸들러 오류:', error);
            }
        });
    }, []);

    const notifyRoomHandlers = useCallback((event) => {
        roomHandlersRef.current.forEach(handler => {
            try {
                handler(event);
            } catch (error) {
                console.error('스터디룸 핸들러 오류:', error);
            }
        });
    }, []);

    // 하트비트 시작
    const startHeartbeat = useCallback((ws) => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        heartbeatIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send('\n');

                } catch (error) {
                    console.error('[StudyRoom] Heartbeat 전송 실패:', error);
                }
            }
        }, 10000);
    }, []);

    // 연결 정리 함수
    const cleanupConnection = useCallback(() => {
        console.log('[StudyRoom] 연결 정리 시작');

        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (websocketRef.current) {
            const ws = websocketRef.current;
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;

            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                try {
                    ws.close(1000, 'Cleanup');
                } catch (error) {
                    console.error('[StudyRoom] WebSocket 종료 오류:', error);
                }
            }

            websocketRef.current = null;
        }

        subscriptionIdsRef.current = [];
        isConnectingRef.current = false;

        console.log('[StudyRoom] 연결 정리 완료');
    }, []);

    // WebSocket 연결
    const connect = useCallback((studyRoomId, isManualReconnect = false) => {
        if (!studyRoomId || !isAuthenticated) {
            console.error('[StudyRoom] 연결 불가: studyRoomId 또는 인증 정보 없음');
            return;
        }

        if (isConnectingRef.current && websocketRef.current?.readyState === WebSocket.CONNECTING) {
            console.warn('[StudyRoom] 이미 연결 시도 중입니다.');
            return;
        }

        console.log('[StudyRoom] WebSocket 연결 시작:', studyRoomId);

        cleanupConnection();
        isConnectingRef.current = true;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = process.env.NODE_ENV === 'production'
            ? window.location.host
            : 'localhost:8080';

        const wsUrl = `${wsProtocol}//${wsHost}/ws/`;
        console.log('[StudyRoom] WebSocket 연결 URL:', wsUrl);

        setConnectionStatus('connecting');
        setCurrentStudyRoomId(studyRoomId);

        try {
            const ws = new WebSocket(wsUrl);
            websocketRef.current = ws;

            ws.onopen = () => {
                console.log('[StudyRoom] WebSocket 연결 열림');

                const accessToken = localStorage.getItem('accessToken');
                const connectFrame = `CONNECT
accept-version:1.2
heart-beat:10000,10000
Authorization:Bearer ${accessToken}

\0`;

                console.log('[StudyRoom] STOMP CONNECT 프레임 전송');
                ws.send(connectFrame);
                startHeartbeat(ws);
            };

            ws.onmessage = (event) => {
                if (event.data.startsWith('CONNECTED')) {
                    console.log('[StudyRoom] STOMP 연결 성공');

                    // To-do 토픽 구독
                    const todoSubId = `sub-todo-${studyRoomId}-${Date.now()}`;
                    const todoSubscribeFrame = `SUBSCRIBE
id:${todoSubId}
destination:/topic/studyroom.${studyRoomId}.todo

\0`;
                    ws.send(todoSubscribeFrame);
                    subscriptionIdsRef.current.push(todoSubId);

                    // 리액션 토픽 구독
                    const reactionSubId = `sub-reaction-${studyRoomId}-${Date.now()}`;
                    const reactionSubscribeFrame = `SUBSCRIBE
id:${reactionSubId}
destination:/topic/studyroom.${studyRoomId}.reaction

\0`;
                    ws.send(reactionSubscribeFrame);
                    subscriptionIdsRef.current.push(reactionSubId);

                    // Presence 토픽 구독 (참여자 입장/퇴장)
                    const presenceSubId = `sub-presence-${studyRoomId}-${Date.now()}`;
                    const presenceSubscribeFrame = `SUBSCRIBE
id:${presenceSubId}
destination:/topic/studyroom.${studyRoomId}.presence

\0`;
                    ws.send(presenceSubscribeFrame);
                    subscriptionIdsRef.current.push(presenceSubId);
                    console.log('[StudyRoom] Presence 토픽 구독:', `/topic/studyroom.${studyRoomId}.presence`);

                    setTimeout(() => {
                        console.log('[StudyRoom] 구독 완료');
                        setConnectionStatus('connected');
                        isConnectingRef.current = false;
                        setReconnectAttempts(0);
                    }, 500);
                }
                // STOMP MESSAGE 프레임
                else if (event.data.startsWith('MESSAGE')) {
                    const messageData = parseStompMessage(event.data);
                    console.log('[StudyRoom] 파싱된 메시지:', messageData);

                    if (messageData) {
                        // To-do 관련 이벤트 처리
                        if (messageData.type === 'TODO_CREATED' ||
                            messageData.type === 'TODO_UPDATED' ||
                            messageData.type === 'TODO_DELETED' ||
                            messageData.type === 'TODO_COMPLETED') {
                            notifyTodoHandlers(messageData);
                        }
                        // 리액션 관련 이벤트 처리
                        else if (messageData.type === 'REACTION_ADDED' ||
                            messageData.type === 'REACTION_DELETED') {
                            notifyReactionHandlers(messageData);
                        }
                        // 투표 관련 이벤트 처리
                        else if (messageData.type === 'VOTE_UPDATED' ||
                            messageData.type === 'ROOM_EXTENDED') {
                            notifyVoteHandlers(messageData);
                        }
                        // 스터디룸 관련 이벤트 처리
                        else if (messageData.type === 'USER_JOINED' ||
                            messageData.type === 'USER_LEFT' ||
                            messageData.type === 'ROOM_CLOSED') {
                            notifyRoomHandlers(messageData);
                        }
                    }
                }
                // STOMP ERROR 프레임
                else if (event.data.startsWith('ERROR')) {
                    console.error('[StudyRoom] STOMP ERROR:', event.data);
                    setConnectionStatus('error');
                    isConnectingRef.current = false;
                }
                // 하트비트
                else if (event.data === '\n') {

                }
            };

            ws.onclose = (event) => {
                console.log('[StudyRoom] WebSocket 연결 종료:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });

                isConnectingRef.current = false;
                setConnectionStatus('disconnected');

                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = null;
                }

                // 자동 재연결
                if (event.code !== 1000 && currentStudyRoomId === studyRoomId && !isManualReconnect) {
                    const attempts = reconnectAttempts + 1;
                    setReconnectAttempts(attempts);

                    if (attempts <= 5) {
                        const delay = Math.min(3000 * attempts, 15000);
                        console.log(`[StudyRoom] 재연결 시도 예약: ${delay / 1000}초 후 (${attempts}/5)`);

                        reconnectTimeoutRef.current = setTimeout(() => {
                            console.log('[StudyRoom] 자동 재연결 시도 실행');
                            connect(studyRoomId, false);
                        }, delay);
                    } else {
                        console.error('[StudyRoom] 최대 재연결 횟수 초과');
                        setConnectionStatus('error');
                    }
                }
            };

            ws.onerror = (error) => {
                console.error('[StudyRoom] WebSocket 오류:', error);
                isConnectingRef.current = false;
                setConnectionStatus('error');
            };

        } catch (error) {
            console.error('[StudyRoom] WebSocket 생성 실패:', error);
            isConnectingRef.current = false;
            setConnectionStatus('error');
        }

    }, [isAuthenticated, currentStudyRoomId, notifyTodoHandlers, notifyReactionHandlers,
        notifyVoteHandlers, notifyRoomHandlers, cleanupConnection, startHeartbeat, reconnectAttempts]);

    // 수동 재연결
    const reconnect = useCallback(() => {
        console.log('[StudyRoom] 수동 재연결 요청');
        setReconnectAttempts(0);

        if (currentStudyRoomId) {
            connect(currentStudyRoomId, true);
        } else {
            console.error('[StudyRoom] 재연결할 스터디룸 ID가 없습니다.');
        }
    }, [currentStudyRoomId, connect]);

    // WebSocket 연결 해제
    const disconnect = useCallback(() => {
        console.log('[StudyRoom] WebSocket 연결 해제 요청');

        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            // 구독 취소
            subscriptionIdsRef.current.forEach(subId => {
                const unsubscribeFrame = `UNSUBSCRIBE
id:${subId}

\0`;
                try {
                    websocketRef.current.send(unsubscribeFrame);
                    console.log('[StudyRoom] 구독 취소:', subId);
                } catch (error) {
                    console.error('[StudyRoom] UNSUBSCRIBE 프레임 전송 실패:', error);
                }
            });

            // DISCONNECT
            const disconnectFrame = `DISCONNECT

\0`;
            try {
                websocketRef.current.send(disconnectFrame);
            } catch (error) {
                console.error('[StudyRoom] DISCONNECT 프레임 전송 실패:', error);
            }
        }

        cleanupConnection();
        setConnectionStatus('disconnected');
        setCurrentStudyRoomId(null);
        setReconnectAttempts(0);

        console.log('[StudyRoom] WebSocket 연결 해제 완료');
    }, [cleanupConnection]);

    // To-do 업데이트 전송
    const sendTodoUpdate = useCallback((studyRoomId, todoData) => {
        const ws = websocketRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('[StudyRoom] WebSocket이 연결되지 않음');
            return false;
        }

        if (connectionStatus !== 'connected') {
            console.warn('[StudyRoom] STOMP 연결이 완료되지 않음');
            return false;
        }

        const sendFrame = `SEND
destination:/app/studyroom.${studyRoomId}.todo.update
content-type:application/json

${JSON.stringify(todoData)}\0`;

        try {
            console.log('[StudyRoom] Todo 업데이트 전송:', todoData);
            ws.send(sendFrame);
            return true;
        } catch (error) {
            console.error('[StudyRoom] Todo 업데이트 전송 실패:', error);
            return false;
        }
    }, [connectionStatus]);

    // 리액션 전송
    const sendReaction = useCallback((studyRoomId, reactionData) => {
        const ws = websocketRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('[StudyRoom] WebSocket이 연결되지 않음');
            return false;
        }

        if (connectionStatus !== 'connected') {
            console.warn('[StudyRoom] STOMP 연결이 완료되지 않음');
            return false;
        }

        const sendFrame = `SEND
destination:/app/studyroom.${studyRoomId}.reaction.send
content-type:application/json

${JSON.stringify(reactionData)}\0`;

        try {
            console.log('[StudyRoom] 리액션 전송:', reactionData);
            ws.send(sendFrame);
            return true;
        } catch (error) {
            console.error('[StudyRoom] 리액션 전송 실패:', error);
            return false;
        }
    }, [connectionStatus]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            cleanupConnection();
        };
    }, [cleanupConnection]);

    const value = {
        connectionStatus,
        currentStudyRoomId,
        reconnectAttempts,
        connect,
        disconnect,
        reconnect,
        sendTodoUpdate,
        sendReaction,
        addTodoHandler,
        addReactionHandler,
        addVoteHandler,
        addRoomHandler
    };

    return (
        <StudyRoomWebSocketContext.Provider value={value}>
            {children}
        </StudyRoomWebSocketContext.Provider>
    );
};

export const useStudyRoomWebSocket = () => {
    const context = useContext(StudyRoomWebSocketContext);
    if (!context) {
        throw new Error('useStudyRoomWebSocket must be used within a StudyRoomWebSocketProvider');
    }
    return context;
};