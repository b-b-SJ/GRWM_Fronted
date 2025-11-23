import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * WebSocketContext
 * - WebSocket 연결 및 STOMP 프로토콜 처리
 * - 메시지 송수신 관리
 * - 연결 상태 관리 및 재연결 로직
 * - 채팅 히스토리 및 채팅방 목록 갱신 트리거
 * - 페이지 이동 후 재진입 시 WebSocket 연결 문제 해결
 * - connect() 호출 시 연결 상태 강제 초기화
 * - isConnectingRef 플래그 개선
 * - 메시지 삭제 WebSocket 기능 연결
 * - 채팅방 입/퇴장 메시지 출력 (ing)
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'; // API_BASE_URL 정의

const WebSocketContext = createContext();

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

export const WebSocketProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();

    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [currentChatRoomId, setCurrentChatRoomId] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const websocketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const messageHandlersRef = useRef([]);
    const deleteHandlersRef = useRef([]);
    const historyLoadCallbackRef = useRef(null);
    const roomListRefreshCallbackRef = useRef(null);
    const tokenValidityCallbackRef = useRef(null);
    const isConnectingRef = useRef(false);
    const subscriptionIdRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);

    // 메시지 핸들러 등록
    const addMessageHandler = useCallback((handler) => {
        messageHandlersRef.current.push(handler);

        // 핸들러 제거 함수 반환
        return () => {
            messageHandlersRef.current = messageHandlersRef.current.filter(h => h !== handler);
        };
    }, []);

    // 삭제 이벤트 핸들러 등록
    const addDeleteHandler = useCallback((handler) => {
        deleteHandlersRef.current.push(handler);

        // 핸들러 제거 함수 반환
        return () => {
            deleteHandlersRef.current = deleteHandlersRef.current.filter(h => h !== handler);
        };
    }, []);

    // 채팅 히스토리 로드 콜백 등록
    const setHistoryLoadCallback = useCallback((callback) => {
        historyLoadCallbackRef.current = callback;
    }, []);

    // 채팅방 목록 갱신 콜백 등록
    const setRoomListRefreshCallback = useCallback((callback) => {
        roomListRefreshCallbackRef.current = callback;
    }, []);

    // 토큰 유효성 확인 콜백 등록
    const setTokenValidityCallback = useCallback((callback) => {
        tokenValidityCallbackRef.current = callback;
    }, []);

    // 수신된 메시지를 모든 핸들러에 전달
    const notifyMessageHandlers = useCallback((message) => {
        messageHandlersRef.current.forEach(handler => {
            try {
                handler(message);
            } catch (error) {
                console.error('메시지 핸들러 오류:', error);
            }
        });
    }, []);

    // 삭제 이벤트를 모든 핸들러에 전달
    const notifyDeleteHandlers = useCallback((deleteEvent) => {
        deleteHandlersRef.current.forEach(handler => {
            try {
                handler(deleteEvent);
            } catch (error) {
                console.error('삭제 핸들러 오류:', error);
            }
        });
    }, []);

    // 하트비트 시작
    const startHeartbeat = useCallback((ws) => {
        // 기존 하트비트 정리
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        // 10초마다 하트비트 전송
        heartbeatIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send('\n');
                    console.log('Heartbeat sent');
                } catch (error) {
                    console.error('Heartbeat 전송 실패:', error);
                }
            }
        }, 10000);
    }, []);

    // 연결 정리 함수
    const cleanupConnection = useCallback(() => {
        console.log('연결 정리 시작');

        // 하트비트 정리
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }

        // 재연결 타이머 정리
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // WebSocket 연결 종료
        if (websocketRef.current) {
            const ws = websocketRef.current;

            // 이벤트 핸들러 제거 (중복 호출 방지)
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;

            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                try {
                    ws.close(1000, 'Cleanup');
                } catch (error) {
                    console.error('WebSocket 종료 오류:', error);
                }
            }

            websocketRef.current = null;
        }

        subscriptionIdRef.current = null;
        isConnectingRef.current = false;

        console.log('연결 정리 완료');
    }, []);

    // WebSocket 연결
    const connect = useCallback((chatRoomId, isManualReconnect = false) => {
        if (!chatRoomId || !isAuthenticated) {
            console.error('WebSocket 연결 불가: chatRoomId 또는 인증 정보 없음');
            return;
        }

        // 이미 연결 중이면 중복 연결 방지
        if (isConnectingRef.current && websocketRef.current?.readyState === WebSocket.CONNECTING) {
            console.warn('이미 연결 시도 중입니다.');
            return;
        }

        console.log('WebSocket 연결 시작:', chatRoomId, isManualReconnect ? '(수동 재연결)' : '');

        // 기존 연결 완전히 정리
        cleanupConnection();

        // 연결 플래그 설정
        isConnectingRef.current = true;

        // WebSocket URL 설정 (API_BASE_URL 기반으로 수정)
        const urlObject = new URL(API_BASE_URL);
        const wsProtocol = urlObject.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = urlObject.host;
        const wsUrl = `${wsProtocol}//${wsHost}/ws/`;
        console.log('WebSocket 연결 URL:', wsUrl);

        setConnectionStatus('connecting');
        setCurrentChatRoomId(chatRoomId);

        try {
            const ws = new WebSocket(wsUrl);
            websocketRef.current = ws;

            // WebSocket 연결 성공
            ws.onopen = () => {
                console.log('WebSocket 연결 열림');

                // STOMP CONNECT 프레임 전송
                const accessToken = localStorage.getItem('accessToken');
                const connectFrame = `CONNECT
accept-version:1.2
heart-beat:10000,10000
Authorization:Bearer ${accessToken}

\0`;

                console.log('STOMP CONNECT 프레임 전송');
                ws.send(connectFrame);

                // 하트비트 시작
                startHeartbeat(ws);
            };

            // 메시지 수신 처리
            ws.onmessage = (event) => {
                console.log('WebSocket 메시지 수신 (첫 100자):', event.data.substring(0, 100));

                // STOMP CONNECTED 프레임
                if (event.data.startsWith('CONNECTED')) {
                    console.log('STOMP 연결 성공');

                    // 구독 ID 생성 (중복 구독 방지)
                    const subId = `sub-${chatRoomId}-${Date.now()}`;
                    subscriptionIdRef.current = subId;

                    // 채팅방 토픽 구독
                    const subscribeFrame = `SUBSCRIBE
id:${subId}
destination:/topic/chat.${chatRoomId}

\0`;

                    console.log('채팅방 구독:', `/topic/chat.${chatRoomId}`, 'ID:', subId);
                    ws.send(subscribeFrame);

                    // 구독 완료 후 히스토리 로드 및 상태 업데이트
                    setTimeout(async () => {
                        console.log('구독 완료');
                        setConnectionStatus('connected');
                        isConnectingRef.current = false;
                        setReconnectAttempts(0);

                        // 채팅 히스토리 로드
                        if (historyLoadCallbackRef.current) {
                            console.log('채팅 히스토리 로드 시작');
                            await historyLoadCallbackRef.current(chatRoomId);
                        }

                        // 토큰 유효성 확인 및 채팅방 목록 갱신
                        try {
                            if (tokenValidityCallbackRef.current && roomListRefreshCallbackRef.current) {
                                const isTokenValid = await tokenValidityCallbackRef.current();
                                if (isTokenValid) {
                                    console.log('채팅방 목록 갱신');
                                    await roomListRefreshCallbackRef.current(true);
                                }
                            }
                        } catch (err) {
                            console.warn('채팅방 목록 갱신 실패:', err);
                        }
                    }, 500);
                }
                // STOMP MESSAGE 프레임 (실제 채팅 메시지)
                else if (event.data.startsWith('MESSAGE')) {
                    const messageData = parseStompMessage(event.data);

                    console.log('파싱된 메시지 데이터:', messageData);

                    if (messageData) {
                        // 삭제 응답인지 확인 (deleteMessageId 필드가 있으면 삭제 응답)
                        if (messageData.deleteMessageId !== undefined) {
                            console.log('메시지 삭제 이벤트 수신:', messageData);

                            const deleteEvent = {
                                type: 'DELETE',
                                messageId: messageData.deleteMessageId,
                                chatRoomId: messageData.chatRoomId || chatRoomId
                            };

                            notifyDeleteHandlers(deleteEvent);
                            return; // 일반 메시지로 처리하지 않음
                        }

                        // 일반 메시지 처리
                        if (!messageData.messageId) {
                            console.warn('messageId가 없는 메시지:', messageData);
                            return;
                        }

                        // 메시지 포맷팅
                        let formattedMessage = {
                            id: messageData.messageId,
                            content: messageData.content,
                            sender: messageData.writerChatName,
                            senderId: messageData.senderId,
                            timestamp: messageData.createdAt,
                            type: messageData.type === 0 ? 'chat' :
                                messageData.type === 1 ? 'system' :  // join → system
                                    messageData.type === 3 ? 'system' : 'chat',  // leave → system
                            replyMessageId: messageData.replyMessageId || null
                        };

                        // 입장/퇴장 메시지 내용 처리 (추가)
                        if (messageData.type === 1) {
                            formattedMessage.content = `${messageData.writerChatName}님이 입장하셨습니다.`;
                        } else if (messageData.type === 3) {
                            formattedMessage.content = `${messageData.writerChatName}님이 퇴장하셨습니다.`;
                        }

                        console.log('채팅 메시지 수신:', formattedMessage);

                        // 등록된 메시지 핸들러들에게 전달
                        notifyMessageHandlers(formattedMessage);
                    }
                }

                // STOMP ERROR 프레임
                else if (event.data.startsWith('ERROR')) {
                    console.error('STOMP ERROR:', event.data);
                    setConnectionStatus('error');
                    isConnectingRef.current = false;
                }
                // STOMP RECEIPT 프레임
                else if (event.data.startsWith('RECEIPT')) {
                    console.log('STOMP RECEIPT:', event.data);
                }
                // 기타 프레임 (하트비트 응답 등)
                else if (event.data === '\n') {
                    console.log('Heartbeat received');
                }
                // 기타 프레임
                else {
                    console.log('기타 STOMP 프레임:', event.data.substring(0, 50));
                }
            };

            // WebSocket 연결 종료
            ws.onclose = (event) => {
                console.log('WebSocket 연결 종료:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });

                isConnectingRef.current = false;
                setConnectionStatus('disconnected');

                // 하트비트 정리
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = null;
                }

                // 정상 종료(1000)가 아니고 현재 채팅방이 유효한 경우 자동 재연결 시도
                if (event.code !== 1000 && currentChatRoomId === chatRoomId && !isManualReconnect) {
                    const attempts = reconnectAttempts + 1;
                    setReconnectAttempts(attempts);

                    // 최대 5번까지만 자동 재연결 시도
                    if (attempts <= 5) {
                        const delay = Math.min(3000 * attempts, 15000); // 최대 15초
                        console.log(`재연결 시도 예약: ${delay / 1000}초 후 (${attempts}/5)`);

                        reconnectTimeoutRef.current = setTimeout(() => {
                            console.log('자동 재연결 시도 실행');
                            connect(chatRoomId, false);
                        }, delay);
                    } else {
                        console.error('최대 재연결 횟수 초과. 수동 재연결이 필요합니다.');
                        setConnectionStatus('error');
                    }
                }
            };

            // WebSocket 에러
            ws.onerror = (error) => {
                console.error('WebSocket 오류:', error);
                isConnectingRef.current = false;
                setConnectionStatus('error');
            };

        } catch (error) {
            console.error('WebSocket 생성 실패:', error);
            isConnectingRef.current = false;
            setConnectionStatus('error');
        }

    }, [isAuthenticated, currentChatRoomId, notifyMessageHandlers, notifyDeleteHandlers, cleanupConnection, startHeartbeat, reconnectAttempts]);

    // 수동 재연결
    const reconnect = useCallback(() => {
        console.log('수동 재연결 요청');
        setReconnectAttempts(0); // 재연결 횟수 초기화

        if (currentChatRoomId) {
            connect(currentChatRoomId, true);
        } else {
            console.error('재연결할 채팅방 ID가 없습니다.');
        }
    }, [currentChatRoomId, connect]);

    // WebSocket 연결 해제
    const disconnect = useCallback(() => {
        console.log('WebSocket 연결 해제 요청');

        // WebSocket 연결 종료
        if (websocketRef.current) {
            if (websocketRef.current.readyState === WebSocket.OPEN) {
                // STOMP UNSUBSCRIBE 프레임 전송
                if (subscriptionIdRef.current) {
                    const unsubscribeFrame = `UNSUBSCRIBE
id:${subscriptionIdRef.current}

\0`;
                    try {
                        websocketRef.current.send(unsubscribeFrame);
                        console.log('구독 취소:', subscriptionIdRef.current);
                    } catch (error) {
                        console.error('UNSUBSCRIBE 프레임 전송 실패:', error);
                    }
                }

                // STOMP DISCONNECT 프레임 전송
                const disconnectFrame = `DISCONNECT

\0`;
                try {
                    websocketRef.current.send(disconnectFrame);
                } catch (error) {
                    console.error('DISCONNECT 프레임 전송 실패:', error);
                }
            }
        }

        // 연결 정리
        cleanupConnection();
        setConnectionStatus('disconnected');
        setCurrentChatRoomId(null);
        setReconnectAttempts(0);

        console.log('WebSocket 연결 해제 완료');
    }, [cleanupConnection]);

    // 메시지 전송
    const sendMessage = useCallback((chatRoomId, content, userId, replyMessageId = null) => {
        const ws = websocketRef.current;

        // WebSocket 연결 상태 확인
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket이 연결되지 않음 (readyState:', ws?.readyState, ')');
            return false;
        }

        if (connectionStatus !== 'connected') {
            console.warn('STOMP 연결이 완료되지 않음 (status:', connectionStatus, ')');
            return false;
        }

        if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
            // 사용자에게 연결이 끊어졌음을 알리고 수동 재연결 버튼을 클릭하도록 유도
            alert('채팅 연결이 끊어졌습니다. 다시 연결을 시도합니다.');
            reconnect(); // 수동 재연결 함수 호출
            return;
        }

        // 메시지 데이터 구성
        const messageData = {
            chatRoomId: parseInt(chatRoomId),
            content: content,
            communityId: userId,
            replyMessageId : replyMessageId
        };

        // STOMP SEND 프레임 생성
        const sendFrame = `SEND
destination:/app/chat.${chatRoomId}.sendMessage
content-type:application/json

${JSON.stringify(messageData)}\0`;

        try {
            console.log('메시지 전송:', messageData);
            ws.send(sendFrame);
            return true;
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            return false;
        }
    }, [connectionStatus, reconnect]);

    // 메시지 삭제 (WebSocket 통신)
    const deleteMessage = useCallback((chatRoomId, messageId, userId) => {
        const ws = websocketRef.current;

        // WebSocket 연결 상태 확인
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket이 연결되지 않음 (readyState:', ws?.readyState, ')');
            return false;
        }

        if (connectionStatus !== 'connected') {
            console.warn('STOMP 연결이 완료되지 않음 (status:', connectionStatus, ')');
            return false;
        }

        // 삭제 요청 데이터 구성
        const deleteData = {
            deleteMessageId: parseInt(messageId),
            chatRoomId: parseInt(chatRoomId),
            senderId: parseInt(userId)
        };

        // STOMP SEND 프레임 생성 (삭제 전용 엔드포인트)
        const sendFrame = `SEND
destination:/app/chat.${chatRoomId}.deleteMessage
content-type:application/json

${JSON.stringify(deleteData)}\0`;

        try {
            console.log('메시지 삭제 WebSocket 전송:', deleteData);
            ws.send(sendFrame);
            return true;
        } catch (error) {
            console.error('메시지 삭제 WebSocket 전송 실패:', error);
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
        currentChatRoomId,
        reconnectAttempts,
        connect,
        disconnect,
        reconnect,
        sendMessage,
        deleteMessage,
        addMessageHandler,
        addDeleteHandler,
        setHistoryLoadCallback,
        setRoomListRefreshCallback,
        setTokenValidityCallback
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};