import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ChatStateContext = createContext();

export const ChatStateProvider = ({ children }) => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [replyTo, setReplyTo] = useState(null);
    const websocketRef = useRef(null);

    const [currentUser] = useState({
        id: 1,
        username: '김사용자',
        communityNickname: '스터디러버',
        email: 'user@example.com'
    });

    const [chatRooms] = useState([
        {
            id: 'room1',
            name: '프론트엔드 스터디',
            members: 12,
            isPrivate: false,
            isOwner: true,
            hasNotification: true
        },
        {
            id: 'room2',
            name: '알고리즘 문제풀이',
            members: 8,
            isPrivate: false,
            isOwner: false,
            hasNotification: false
        },
        {
            id: 'room3',
            name: '팀 프로젝트',
            members: 4,
            isPrivate: true,
            isOwner: false,
            hasNotification: true
        }
    ]);

    // WebSocket 연결
    const connectWebSocket = (roomId) => {
        if (websocketRef.current) {
            websocketRef.current.close();
        }

        // 실제 백엔드 URL로 변경 필요
        const wsUrl = `ws://localhost:8080/ws/chat/${roomId}?userId=${currentUser.id}`;
        websocketRef.current = new WebSocket(wsUrl);

        websocketRef.current.onopen = () => {
            setConnectionStatus('connected');
            console.log('WebSocket 연결됨');
        };

        websocketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        websocketRef.current.onclose = () => {
            setConnectionStatus('disconnected');
            console.log('WebSocket 연결 종료');
        };

        websocketRef.current.onerror = (error) => {
            console.error('WebSocket 에러:', error);
            setConnectionStatus('error');
        };
    };

    // WebSocket 메시지 처리
    const handleWebSocketMessage = (data) => {
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
                    [data.roomId]: data.messages
                }));
                break;
            case 'user_joined':
                console.log(`${data.username}님이 참여했습니다.`);
                break;
            case 'user_left':
                console.log(`${data.username}님이 나갔습니다.`);
                break;
            default:
                console.log('알 수 없는 메시지 타입:', data);
        }
    };

    // 메시지 추가
    const addMessage = (roomId, message) => {
        setMessages(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), message]
        }));
    };

    // 메시지 삭제
    const deleteMessage = (roomId, messageId, deleteType) => {
        setMessages(prev => ({
            ...prev,
            [roomId]: prev[roomId]?.map(msg =>
                msg.id === messageId
                    ? { ...msg, isDeleted: true, deleteType }
                    : msg
            ) || []
        }));
    };

    // 메시지 전송
    const sendMessage = (roomId, content, replyToId = null) => {
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
        }
    };

    // 메시지 삭제 요청
    const requestDeleteMessage = (roomId, messageId) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            const deleteData = {
                type: 'delete_message',
                roomId,
                messageId,
                userId: currentUser.id
            };
            websocketRef.current.send(JSON.stringify(deleteData));
        }
    };

    // 방 입장
    const joinRoom = (roomId) => {
        setSelectedRoom(roomId);
        connectWebSocket(roomId);

        // 메시지 히스토리 요청
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({
                type: 'get_history',
                roomId,
                userId: currentUser.id
            }));
        }
    };

    // 방 나가기
    const leaveRoom = () => {
        if (websocketRef.current) {
            websocketRef.current.close();
        }
        setSelectedRoom(null);
        setReplyTo(null);
    };

    // 컴포넌트 언마운트 시 연결 종료
    useEffect(() => {
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, []);

    const value = {
        selectedRoom,
        setSelectedRoom,
        chatRooms,
        currentUser,
        messages,
        connectionStatus,
        replyTo,
        setReplyTo,
        sendMessage,
        requestDeleteMessage,
        joinRoom,
        leaveRoom
    };

    return (
        <ChatStateContext.Provider value={value}>
            {children}
        </ChatStateContext.Provider>
    );
};

export const useChatState = () => {
    const context = useContext(ChatStateContext);
    if (!context) {
        throw new Error('useChatState must be used within a ChatStateProvider');
    }
    return context;
};