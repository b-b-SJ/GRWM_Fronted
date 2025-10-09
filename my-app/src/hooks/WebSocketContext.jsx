import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * WebSocketContext
 * - WebSocket 연결 및 STOMP 프로토콜 처리
 * - 메시지 송수신 관리
 * - 연결 상태 관리 및 재연결 로직
 * - 채팅 히스토리 및 채팅방 목록 갱신 트리거
 */

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

    const websocketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const messageHandlersRef = useRef([]);
    const historyLoadCallbackRef = useRef(null);
    const roomListRefreshCallbackRef = useRef(null);
    const tokenValidityCallbackRef = useRef(null);

    // 메시지 핸들러 등록
    const addMessageHandler = useCallback((handler) => {
        messageHandlersRef.current.push(handler);

        // 핸들러 제거 함수 반환
        return () => {
            messageHandlersRef.current = messageHandlersRef.current.filter(h => h !== handler);
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

    // WebSocket 연결
    const connect = useCallback((chatRoomId) => {
        if (!chatRoomId || !isAuthenticated) {
            console.error('WebSocket 연결 불가: chatRoomId 또는 인증 정보 없음');
            return;
        }

        console.log('WebSocket 연결 시작:', chatRoomId);

        // 기존 연결 정리
        if (websocketRef.current && websocketRef.current.readyState !== WebSocket.CLOSED) {
            console.log('기존 WebSocket 연결 종료');
            websocketRef.current.close(1000, 'New connection');
            websocketRef.current = null;
        }

        // 재연결 타이머 정리
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // WebSocket URL 설정
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = process.env.NODE_ENV === 'production'
            ? window.location.host
            : 'localhost:8080';

        const wsUrl = `${wsProtocol}//${wsHost}/ws/chatroom`;
        console.log('WebSocket 연결 URL:', wsUrl);

        setConnectionStatus('connecting');
        setCurrentChatRoomId(chatRoomId);

        const ws = new WebSocket(wsUrl);
        websocketRef.current = ws;

        // WebSocket 연결 성공
        ws.onopen = () => {
            console.log('✅ WebSocket 연결 열림');

            // STOMP CONNECT 프레임 전송
            const accessToken = localStorage.getItem('accessToken');
            const connectFrame = `CONNECT
accept-version:1.2
heart-beat:20000,20000
Authorization:Bearer ${accessToken}

\0`;

            console.log('STOMP CONNECT 프레임 전송');
            ws.send(connectFrame);
        };

        // 메시지 수신 처리
        ws.onmessage = (event) => {
            console.log('WebSocket 메시지 수신 (첫 100자):', event.data.substring(0, 100));

            // STOMP CONNECTED 프레임
            if (event.data.startsWith('CONNECTED')) {
                console.log('STOMP 연결 성공');

                // 채팅방 토픽 구독
                const subscribeFrame = `SUBSCRIBE
id:sub-${chatRoomId}
destination:/topic/chat.${chatRoomId}

\0`;

                console.log('📡 채팅방 구독:', `/topic/chat.${chatRoomId}`);
                ws.send(subscribeFrame);

                // 구독 완료 후 히스토리 로드 및 상태 업데이트
                setTimeout(async () => {
                    console.log('구독 완료');
                    setConnectionStatus('connected');

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
                        console.warn('⚠채팅방 목록 갱신 실패:', err);
                    }
                }, 500);
            }
            // STOMP MESSAGE 프레임 (실제 채팅 메시지)
            else if (event.data.startsWith('MESSAGE')) {
                const messageData = parseStompMessage(event.data);
                console.log('채팅 메시지 수신 (원본):', messageData);

                if (messageData) {
                    // 메시지 포맷팅
                    const formattedMessage = {
                        id: messageData.messageId,
                        content: messageData.content,
                        sender: messageData.writerChatName,
                        senderId: messageData.senderId,
                        timestamp: messageData.createdAt,
                        type: messageData.type === 0 ? 'chat' :
                            messageData.type === 1 ? 'join' : 'leave',
                        replyToMessageId: messageData.replytoMessageId || null
                    };

                    console.log('포맷된 메시지:', formattedMessage);

                    // 등록된 메시지 핸들러들에게 전달
                    notifyMessageHandlers(formattedMessage);
                }
            }
            // STOMP ERROR 프레임
            else if (event.data.startsWith('ERROR')) {
                console.error('STOMP ERROR:', event.data);
                setConnectionStatus('error');
            }
            // STOMP RECEIPT 프레임
            else if (event.data.startsWith('RECEIPT')) {
                console.log('STOMP RECEIPT:', event.data);
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

            setConnectionStatus('disconnected');

            // 정상 종료(1000)가 아니고 현재 채팅방이 유효한 경우 재연결 시도
            if (event.code !== 1000 && currentChatRoomId === chatRoomId) {
                console.log('3초 후 재연결 시도...');
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('재연결 시도 실행');
                    connect(chatRoomId);
                }, 3000);
            }
        };

        // WebSocket 에러
        ws.onerror = (error) => {
            console.error('WebSocket 오류:', error);
            setConnectionStatus('error');
        };

    }, [isAuthenticated, currentChatRoomId, notifyMessageHandlers]);

    // WebSocket 연결 해제
    const disconnect = useCallback(() => {
        console.log('WebSocket 연결 해제 요청');

        // 재연결 타이머 정리
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // WebSocket 연결 종료
        if (websocketRef.current) {
            if (websocketRef.current.readyState === WebSocket.OPEN) {
                // STOMP DISCONNECT 프레임 전송
                const disconnectFrame = `DISCONNECT

\0`;
                try {
                    websocketRef.current.send(disconnectFrame);
                } catch (error) {
                    console.error('DISCONNECT 프레임 전송 실패:', error);
                }
            }

            websocketRef.current.close(1000, 'User disconnect');
            websocketRef.current = null;
        }

        setConnectionStatus('disconnected');
        setCurrentChatRoomId(null);

        console.log('WebSocket 연결 해제 완료');
    }, []);

    // 메시지 전송
    const sendMessage = useCallback((chatRoomId, content, userId, replyToId = null) => {
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

        // 메시지 데이터 구성
        const messageData = {
            chatRoomId: parseInt(chatRoomId),
            content: content,
            communityId: userId
            // replytoMessageId: replyToId  // 답장 기능 구현 시 주석 해제
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
    }, [connectionStatus]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (websocketRef.current) {
                websocketRef.current.close(1000, 'Component unmount');
            }
        };
    }, []);

    const value = {
        connectionStatus,
        currentChatRoomId,
        connect,
        disconnect,
        sendMessage,
        addMessageHandler,
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