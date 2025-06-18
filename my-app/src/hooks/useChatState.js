import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

/**
 * useChatStae 커스텀 훅
 * - ChatStateProvider 컴포넌트
 * - 이후 WebSocket 관리는 분리할 예정
 */

// 채팅 상태를 전역에서 관리할 Context 생성
const ChatStateContext = createContext();

// Chat 상태를 제공하는 Provider 컴포넌트
export const ChatStateProvider = ({ children }) => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [replyTo, setReplyTo] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const websocketRef = useRef(null);

    // 유저 정보, 이후에 API 연결 필요
    const [currentUser] = useState({
        id: 1,
        username: '박사용자',
        communityNickname: '농담곰러버',
        email: 'user@example.com'
    });

    // 채팅방 목록 조회
    const fetchChatRooms = useCallback(async () => {
        setIsLoadingRooms(true);
        try {
            const response = await fetch(`/api/chat-room/show/{userId}/joinlist`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const rooms = await response.json();
                setChatRooms(rooms);
            } else {
                console.error('채팅방 목록 조회 실패');
                // 실패 시 기본 목록 사용
                setChatRooms([
                    {
                        roomId: 'room1',
                        roomName: '졸업 프로젝트',
                        members: 3,
                        isPrivate: false,
                        isOwner: true,
                        hasNotification: false,
                        category: '프로젝트'
                    },
                    {
                        roomId: 'room2',
                        roomName: '소공 스터디',
                        members: 10,
                        isPrivate: true,
                        isOwner: false,
                        hasNotification: false,
                        category: '스터디'
                    }
                ]);
            }
        } catch (error) {
            console.error('채팅방 목록 조회 에러:', error);
            // 에러 시 기본 목록 사용
            setChatRooms([
                {
                    roomId: 'room1',
                    roomName: '졸업 프로젝트',
                    members: 3,
                    isPrivate: false,
                    isOwner: true,
                    hasNotification: false,
                    category: '프로젝트'
                },
                {
                    roomId: 'room2',
                    roomName: '소공 스터디',
                    members: 10,
                    isPrivate: true,
                    isOwner: false,
                    hasNotification: false,
                    category: '스터디'
                }
            ]);
        } finally {
            setIsLoadingRooms(false);
        }
    }, [currentUser.id]);

    // 채팅방 생성
    const createChatRoom = useCallback(async (roomData) => {
        try {
            const requestData = {
                userId: currentUser.id,
                roomName: roomData.roomName.trim(),
                category: roomData.category,
                description: roomData.description.trim(),
                isPrivate: roomData.isPrivate,
                password: roomData.isPrivate ? roomData.password.trim() : null,
                maxMembers: roomData.maxMembers || 30
            };

            const response = await fetch('/api/chat-room/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '채팅방 생성에 실패했습니다.');
            }

            const newRoomId = await response.json();

            // 채팅방 목록 새로고침
            await fetchChatRooms();

            return newRoomId;
        } catch (error) {
            console.error('채팅방 생성 오류:', error);
            throw error;
        }
    }, [currentUser.id, fetchChatRooms]);

    // 채팅방 참여
    const joinChatRoom = useCallback(async (roomId, password = null) => {
        try {
            const requestData = {
                userId: currentUser.id,
                roomId: roomId,
                password: password
            };

            const response = await fetch('/api/chat-room/{chatRoomId}/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '채팅방 참여에 실패했습니다.');
            }

            // 성공 시 채팅방 목록 새로고침
            await fetchChatRooms();

            return true;
        } catch (error) {
            console.error('채팅방 참여 오류:', error);
            throw error;
        }
    }, [currentUser.id, fetchChatRooms]);

    // 채팅방 나가기
    const leaveChatRoom = useCallback(async (roomId) => {
        try {
            const response = await fetch('/api/chat-room/leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    roomId: roomId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '채팅방 나가기에 실패했습니다.');
            }

            // 현재 선택된 방이면 선택 해제
            if (selectedRoom === roomId) {
                leaveRoom();
            }

            // 채팅방 목록 새로고침
            await fetchChatRooms();

            return true;
        } catch (error) {
            console.error('채팅방 나가기 오류:', error);
            throw error;
        }
    }, [currentUser.id, selectedRoom, fetchChatRooms]);

    /**
     * WebSocket 연결 관련 함수들. 시도했으나 실패하여 이후 수정 필수.
     * 또한 WebSocket 핸들러 분리할 예정
     */
    // WebSocket 연결
    const connectWebSocket = useCallback((roomId) => {
        if (websocketRef.current) {
            websocketRef.current.close();
        }

        // 환경에 따른 WebSocket URL 설정
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = process.env.NODE_ENV === 'production'
            ? window.location.host
            : 'localhost:8080';

        const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${roomId}?userId=${currentUser.id}`;

        websocketRef.current = new WebSocket(wsUrl);

        websocketRef.current.onopen = () => {
            setConnectionStatus('connected');
            console.log('WebSocket 연결됨:', roomId);

            // 연결 후 메시지 히스토리 요청
            if (websocketRef.current.readyState === WebSocket.OPEN) {
                websocketRef.current.send(JSON.stringify({
                    type: 'get_history',
                    roomId,
                    userId: currentUser.id
                }));
            }
        };

        websocketRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (error) {
                console.error('WebSocket 메시지 파싱 에러:', error);
            }
        };

        websocketRef.current.onclose = (event) => {
            setConnectionStatus('disconnected');
            console.log('WebSocket 연결 종료:', event.code, event.reason);

            // 비정상 종료인 경우 재연결 시도
            if (event.code !== 1000 && selectedRoom) {
                setTimeout(() => {
                    if (selectedRoom === roomId) {
                        console.log('WebSocket 재연결 시도...');
                        connectWebSocket(roomId);
                    }
                }, 3000);
            }
        };

        websocketRef.current.onerror = (error) => {
            console.error('WebSocket 에러:', error);
            setConnectionStatus('error');
        };
    }, [currentUser.id, selectedRoom]);

    // WebSocket 메시지 처리
    const handleWebSocketMessage = useCallback((data) => {
        switch (data.type) {
            case 'message':
                addMessage(data.roomId, data.message);
                break;
            case 'message_deleted':
                deleteMessage(data.roomId, data.messageId, data.deleteType);
                break;
            case 'message_history':
                setMessages(prev => ({
                    ...prev,
                    [data.roomId]: data.messages || []
                }));
                break;
            case 'user_joined':
                console.log(`${data.username}님이 참여했습니다.`);
                // 채팅방 멤버 수 업데이트 등 추가 처리 가능
                break;
            case 'user_left':
                console.log(`${data.username}님이 나갔습니다.`);
                // 채팅방 멤버 수 업데이트 등 추가 처리 가능
                break;
            case 'room_updated':
                // 채팅방 정보 업데이트
                fetchChatRooms();
                break;
            case 'error':
                console.error('서버 에러:', data.message);
                setConnectionStatus('error');
                break;
            default:
                console.log('알 수 없는 메시지 타입:', data);
        }
    }, [fetchChatRooms]);

    // 메시지 추가
    const addMessage = useCallback((roomId, message) => {
        setMessages(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), message]
        }));
    }, []);

    // 메시지 삭제
    const deleteMessage = useCallback((roomId, messageId, deleteType) => {
        setMessages(prev => ({
            ...prev,
            [roomId]: prev[roomId]?.map(msg =>
                msg.id === messageId
                    ? { ...msg, isDeleted: true, deleteType }
                    : msg
            ) || []
        }));
    }, []);

    // 메시지 전송
    const sendMessage = useCallback((roomId, content, replyToId = null) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            const messageData = {
                type: 'send_message',
                roomId,
                content,
                replyToId,
                userId: currentUser.id,
                username: currentUser.username
            };
            websocketRef.current.send(JSON.stringify(messageData));
        } else {
            console.error('WebSocket이 연결되지 않았습니다.');
            throw new Error('채팅 서버에 연결되지 않았습니다.');
        }
    }, [currentUser.id, currentUser.username]);

    // 메시지 삭제 요청
    const requestDeleteMessage = useCallback((roomId, messageId) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            const deleteData = {
                type: 'delete_message',
                roomId,
                messageId,
                userId: currentUser.id
            };
            websocketRef.current.send(JSON.stringify(deleteData));
        } else {
            console.error('WebSocket이 연결되지 않았습니다.');
            throw new Error('채팅 서버에 연결되지 않았습니다.');
        }
    }, [currentUser.id]);

    // 방 입장
    const joinRoom = useCallback((roomId) => {
        console.log('방 입장:', roomId);
        setSelectedRoom(roomId);
        setReplyTo(null);

        // 기존 메시지 초기화 (선택사항)
        setMessages(prev => ({
            ...prev,
            [roomId]: prev[roomId] || []
        }));

        connectWebSocket(roomId);
    }, [connectWebSocket]);

    // 방 나가기
    const leaveRoom = useCallback(() => {
        console.log('방 나가기');
        if (websocketRef.current) {
            websocketRef.current.close(1000, 'User left room');
        }
        setSelectedRoom(null);
        setReplyTo(null);
        setConnectionStatus('disconnected');
    }, []);

    // 초기 채팅방 목록 불러오기
    useEffect(() => {
        fetchChatRooms();
    }, [fetchChatRooms]);

    // 언마운트 시 WebSocket 정리
    useEffect(() => {
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close(1000, 'Component unmounting');
            }
        };
    }, []);

    // Context 값
    const value = {
        // 상태
        selectedRoom,
        setSelectedRoom,
        chatRooms,
        setChatRooms,
        currentUser,
        messages,
        connectionStatus,
        replyTo,
        setReplyTo,
        isLoadingRooms,

        // 채팅방 관리 함수
        createChatRoom,
        joinChatRoom,
        leaveChatRoom,
        fetchChatRooms,

        // 채팅 기능 함수
        sendMessage,
        requestDeleteMessage,
        joinRoom,
        leaveRoom,

        // WebSocket 관리
        connectWebSocket
    };

    return (
        <ChatStateContext.Provider value={value}>
            {children}
        </ChatStateContext.Provider>
    );
};

// 커스텀 훅: 컴포넌트에서 ChatState 쉽게 사용
export const useChatState = () => {
    const context = useContext(ChatStateContext);
    if (!context) {
        throw new Error('useChatState must be used within a ChatStateProvider');
    }
    return context;
};