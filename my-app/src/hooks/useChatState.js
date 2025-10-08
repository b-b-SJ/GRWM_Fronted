import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

/**
 * useChatState 커스텀 훅
 * - AuthContext와 연동하여 로그인한 유저의 채팅방 로딩
 * - 메시지 히스토리 URL 수정: /api/chatroom/{chatRoomId}/show (0930)
 * - 메시지 삭제 REST API 사용: /api/chatroom/{chatRoomId}/delete/{messageId} (0930)
 * - DTO 수정: communityId(전송) / senderId(수신), replytoMessageId 추가 (1002)
 */

// 카테고리 매핑 상수
const CATEGORY_MAP = {
    '일반': { id: 1, name: '일반' },
    '프로젝트': { id: 2, name: '프로젝트' },
    '스터디': { id: 3, name: '스터디' },
    '취미': { id: 4, name: '취미' },
    '기타': { id: 5, name: '기타' }
};

const getCategoryNameById = (categoryId) => {
    const category = Object.values(CATEGORY_MAP).find(cat => cat.id === categoryId);
    return category ? category.name : '기타';
};

const getCategoryIdByName = (categoryName) => {
    const category = CATEGORY_MAP[categoryName];
    return category ? category.id : CATEGORY_MAP['기타'].id;
};

const ChatStateContext = createContext();

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

// 백엔드 연결 실패 시, 테스트 용 채팅방
const getTestRooms = (username, isTemporary = false) => {
    return [
        {
            chatRoomId: 10,
            chatRoomName: `${username}님의 테스트 채팅방`,
            roomName: `${username}님의 테스트 채팅방`,
            name: `${username}님의 테스트 채팅방`,
            currentMembers: 5,
            members: 5,
            maxMembers: 30,
            isPrivate: false,
            category: CATEGORY_MAP['일반'].id,
            description: 'API 테스트용 채팅방입니다.',
            createdAt: new Date().toISOString(),
        },
    ];
};

export const ChatStateProvider = ({ children }) => {
    const { user, isAuthenticated, getAuthHeaders } = useAuth();
    const location = useLocation();

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [replyTo, setReplyTo] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const websocketRef = useRef(null);
    const apiCallRef = useRef(null);

    const currentUser = user || {
        userId: null,
        username: '게스트',
        loginId: null
    };

    const isChatPage = location.pathname.startsWith('/workspace');

    const checkTokenValidity = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            console.log('Token validity:', {
                exp: new Date(payload.exp * 1000),
                isExpired
            });

            return !isExpired;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }, []);

    const fetchChatRooms = useCallback(async (skipTokenCheck = false) => {
        if (!isAuthenticated || !currentUser.userId) {
            setChatRooms([]);
            return;
        }

        if (apiCallRef.current) {
            console.log('API call in progress, skipping');
            return;
        }

        if (currentUser.isTemporary) {
            setChatRooms(getTestRooms(currentUser.username, true));
            return;
        }

        if (!skipTokenCheck && !(await checkTokenValidity())) {
            setChatRooms(getTestRooms(currentUser.username));
            return;
        }

        setIsLoadingRooms(true);
        apiCallRef.current = true;

        try {
            const response = await fetch(`/api/chat-room/show/${currentUser.userId}/joinlist`, {
                method: 'GET',
                headers: {
                    ...getAuthHeaders(),
                    'Cache-Control': 'no-cache'  // 캐시 방지
                }
            });

            if (response.ok) {
                const rooms = await response.json();
                // 백엔드 원본 응답 확인
                console.log('=== 백엔드 원본 응답 ===');
                console.log('전체 rooms:', rooms);

                if (rooms.length > 0) {
                    console.log('첫 번째 방 필드들:', Object.keys(rooms[0]));
                    console.log('첫 번째 방 전체 데이터:', rooms[0]);
                }

                const processedRooms = rooms.map(room => ({
                    ...room,
                    chatRoomName: room.roomName || room.chatRoomName,
                    currentMembers: room.currentMembers || room.members || 0,
                    isPrivate: room.private || room.isPrivate || false,
                    isManager: room.isManager || room.manager || false
                }));
                setChatRooms(processedRooms);

            } else if (response.status === 403) {
                if (typeof user?.refreshToken === 'function') {
                    try {
                        await user.refreshToken();
                        return fetchChatRooms(true);
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                    }
                }
                setChatRooms(getTestRooms(currentUser.username));
            } else {
                setChatRooms(getTestRooms(currentUser.username));
            }
        } catch (error) {
            console.error('채팅방 목록 조회 오류:', error);
            setChatRooms(getTestRooms(currentUser.username));
        } finally {
            setIsLoadingRooms(false);
            apiCallRef.current = false;
        }
    }, [currentUser.userId, currentUser.username, currentUser.isTemporary, isAuthenticated, getAuthHeaders, checkTokenValidity, user]);

    const createChatRoom = useCallback(async (roomData) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        let categoryId;
        if (typeof roomData.category === 'string') {
            categoryId = getCategoryIdByName(roomData.category);
        } else if (typeof roomData.category === 'number') {
            categoryId = roomData.category;
        } else {
            categoryId = CATEGORY_MAP['일반'].id;
        }

        const requestData = {
            userId: currentUser.userId,
            roomName: roomData.roomName.trim(),
            category: categoryId,
            description: roomData.description.trim(),
            isPrivate: roomData.isPrivate,
            password: roomData.isPrivate ? roomData.password.trim() : null,
            maxMembers: roomData.maxMembers || 30
        };

        const response = await fetch('/api/chat-room/create', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '채팅방 생성에 실패했습니다.');
        }

        return data;
    }, [currentUser.userId, isAuthenticated, getAuthHeaders]);

    const verifyRoomPassword = useCallback(async (chatRoomId, password) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`/api/chat-room/${chatRoomId}/verify`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ password })
        });

        if (response.status === 403) {
            throw new Error('비밀번호가 올바르지 않습니다.');
        }

        if (!response.ok) {
            throw new Error('비밀번호 확인 중 오류가 발생했습니다.');
        }

        return true;
    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    const joinChatRoom = useCallback(async (chatRoomId, chatName = null, isManager = false) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const finalChatName = chatName || currentUser.username || currentUser.loginId || '사용자';

        const requestData = {
            userId: currentUser.userId,
            chatName: finalChatName,
            isManager: isManager  // 파라미터로 받은 값 사용
        };

        console.log('=== JOIN API 호출 ===');
        console.log('URL:', `/api/chat-room/${chatRoomId}/join`);
        console.log('요청 데이터:', requestData);

        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        };

        const fetchOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        };

        try {
            const response = await fetch(`/api/chat-room/${chatRoomId}/join`, fetchOptions);

            const responseText = await response.text();
            console.log('응답 상태:', response.status);
            console.log('응답 본문:', responseText);

            if (!response.ok) {
                if (response.status === 403) {
                    let errorData = {};
                    try {
                        errorData = JSON.parse(responseText);
                    } catch (e) {
                        console.error('응답 파싱 실패:', e);
                    }

                    if (errorData.message && errorData.message.includes('이미')) {
                        await fetchChatRooms();
                        return true;
                    }
                    throw new Error(errorData.message || '채팅방 참여 권한이 없습니다.');
                }
                throw new Error('채팅방 참여에 실패했습니다.');
            }

            await fetchChatRooms();
            return true;
        } catch (error) {
            console.error('JOIN API 에러:', error);
            throw error;
        }
    }, [currentUser.userId, currentUser.username, currentUser.loginId, isAuthenticated, getAuthHeaders, fetchChatRooms]);

    // 채팅방을 떠날 때 UI 상태를 정리
    const leaveRoom = useCallback(() => {
        console.log('방 나가기');
        if (websocketRef.current) {
            websocketRef.current.close(1000, 'User left');
        }
        setSelectedRoom(null);
        setReplyTo(null);
        setConnectionStatus('disconnected');
    }, []);

    // 채팅방 나가기
    const leaveChatRoom = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        console.log('Request URL:', `/api/chat-room/${chatRoomId}/${currentUser.userId}/leave`); // 디버깅용
        console.log('Headers:', getAuthHeaders()); // 디버깅용

        const response = await fetch(`/api/chat-room/${chatRoomId}/leave`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        let data = {};
        if (response.status !== 204) { // 204 No Content가 아닐 경우만 본문 읽기 시도
            try {
                data = await response.json();
            } catch (e) {
                console.warn('DELETE 응답이 JSON이 아님');
            }
        }
        if (!response.ok) {
            throw new Error(data.message || '채팅방 나가기에 실패했습니다.');
        }

        if (selectedRoom === chatRoomId) {
            leaveRoom();
        }

        await fetchChatRooms();
        return true;
    }, [currentUser.userId, isAuthenticated, getAuthHeaders, selectedRoom, fetchChatRooms, leaveRoom]);

    // 채팅방 정보
    const getChatRoomInfo = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`/api/chat-room/show/${chatRoomId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '채팅방 정보 조회 실패');
        }

        return data;

    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    const editChatRoomName = useCallback(async (chatRoomId, roomName, description = null) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const requestData = { roomName: roomName.trim() };
        if (description !== null) {
            requestData.description = description.trim();
        }

        const response = await fetch(`/api/chat-room/${chatRoomId}/edit`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestData)
        });

        let data = {};
        if (response.status !== 204) {
            try {
                data = await response.json();
            } catch (e) {
                console.warn('PATCH 응답이 JSON이 아님');
            }
        }

        if (!response.ok) {
            throw new Error(data.message || '채팅방 정보 수정에 실패했습니다.');
        }


        await fetchChatRooms();
        return true;
    }, [isAuthenticated, currentUser.userId, getAuthHeaders, fetchChatRooms]);

    const deleteChatRoom = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`/api/chat-room/${chatRoomId}/delete`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        let data = {};
        if (response.status !== 204) {
            try {
                data = await response.json();
            } catch (e) {
                console.warn('DELETE 응답이 JSON이 아님');
            }
        }

        if (!response.ok) {
            throw new Error(data.message || '채팅방 삭제에 실패했습니다.');
        }

        if (selectedRoom === chatRoomId) {
            leaveRoom();
        }

        await fetchChatRooms();
        return true;
    }, [isAuthenticated, currentUser.userId, getAuthHeaders, selectedRoom, fetchChatRooms, leaveRoom]);

    const createAnnouncement = useCallback(async (chatRoomId, content) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const chatName = currentUser.username || currentUser.loginId || '사용자';

        const requestData = {
            userId: currentUser.userId,
            chatName: chatName,
            content: content.trim()
        };

        console.log('공지 생성 요청:', {
            chatRoomId,
            userId: currentUser.userId,
            chatName: chatName,
            content: content.trim()
        });

        const response = await fetch(`/api/chat-room/${chatRoomId}/announcement/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('공지 생성 실패:', result);
            throw new Error(result.message || '공지 생성에 실패했습니다.');
        }

    }, [isAuthenticated, currentUser.userId, currentUser.username, currentUser.chatName, getAuthHeaders]);

    // 공지사항 불러오기
    const getMainAnnouncement = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`/api/chat-room/${chatRoomId}/announcement/show/main`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '공지 조회에 실패했습니다.');
        }

        return data;
    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    const createAndJoinRoom = useCallback(async (roomData) => {
        const newChatRoomId = await createChatRoom(roomData);
        const joinResult = await joinChatRoom(newChatRoomId, null, true);

        if (joinResult) {
            return { chatRoomId: newChatRoomId, success: true };
        } else {
            throw new Error('채팅방 참여에 실패했습니다.');
        }
    }, [createChatRoom, joinChatRoom]);

    // 채팅 히스토리 로드 - senderId와 replytoMessageId 추가
    const fetchChatHistory = useCallback(async (chatRoomId) => {
        if (!chatRoomId) {
            console.error('chatRoomId가 없습니다');
            return;
        }

        try {
            console.log('채팅 히스토리 로드:', chatRoomId);

            const response = await fetch(`/api/chatroom/${chatRoomId}/show`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const msgs = await response.json();

                const formattedMessages = msgs.map(msg => ({
                    id: msg.messageId,
                    content: msg.content,
                    sender: msg.writerChatName,
                    senderId: msg.senderId,
                    timestamp: msg.createdAt,
                    type: msg.type === 0 ? 'chat' :
                        msg.type === 1 ? 'join' : 'leave',
                    replyToMessageId: msg.replytoMessageId || null  // 답장 기능용
                }));

                setMessages(prev => ({
                    ...prev,
                    [chatRoomId]: formattedMessages
                }));

                console.log('히스토리 로드 완료:', formattedMessages.length);
            } else {
                console.error('히스토리 조회 실패:', response.status);
            }
        } catch (error) {
            console.error('히스토리 조회 오류:', error);
        }
    }, [getAuthHeaders]);

    const addMessage = useCallback((chatRoomId, message) => {
        setMessages(prev => ({
            ...prev,
            [chatRoomId]: [...(prev[chatRoomId] || []), message]
        }));
    }, []);

    const deleteMessage = useCallback((chatRoomId, messageId, deleteType) => {
        setMessages(prev => ({
            ...prev,
            [chatRoomId]: prev[chatRoomId]?.map(msg =>
                msg.id === messageId
                    ? { ...msg, isDeleted: true, deleteType }
                    : msg
            ) || []
        }));
    }, []);

    // 메시지 전송 - communityId 사용 (백엔드 요구사항)
    const sendMessage = useCallback((chatRoomId, content, replyToId = null) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const ws = websocketRef.current;
        const replyToMessage = replyToId ? messages[chatRoomId]?.find(m => m.id === replyToId) : null;

        if (ws && ws.readyState === WebSocket.OPEN && connectionStatus === 'connected') {
            // 전송 페이로드: communityId 사용
            // 답장 기능이 백엔드에 구현되면 아래 주석 해제하고 사용
            const messageData = {
                chatRoomId: parseInt(chatRoomId),
                content: content,
                communityId: currentUser.userId
                // replytoMessageId: replyToId  //  답장 기능 구현 시 주석 해제
            };

            const sendFrame = `SEND
destination:/app/chat.${chatRoomId}.sendMessage
content-type:application/json

${JSON.stringify(messageData)}\0`;

            console.log('메시지 전송:', messageData);
            ws.send(sendFrame);

            // Optimistic UI 업데이트
            const optimisticMessage = {
                id: `temp-${Date.now()}`,
                content: content,
                sender: currentUser.username,
                senderId: currentUser.userId,
                timestamp: new Date().toISOString(),
                type: 'chat',
                replyToMessageId: replyToId,  // 답장 기능용 (UI에서 사용)
                replyTo: replyToMessage,      // 답장 대상 메시지 정보
                isPending: true
            };

            addMessage(chatRoomId, optimisticMessage);
        } else {
            console.warn('⚠️ WebSocket 미연결');

            // 테스트 메시지 (WebSocket 미연결 시)
            const testMessage = {
                id: `test-${Date.now()}`,
                content: content,
                sender: currentUser.username,
                senderId: currentUser.userId,
                timestamp: new Date().toISOString(),
                type: 'chat',
                replyToMessageId: replyToId,
                replyTo: replyToMessage
            };

            addMessage(chatRoomId, testMessage);
        }
    }, [currentUser.userId, currentUser.username, isAuthenticated, connectionStatus, messages, addMessage]);

    // 메시지 삭제 - REST API 사용
    const requestDeleteMessage = useCallback(async (chatRoomId, messageId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const response = await fetch(`/api/chatroom/${chatRoomId}/delete/${messageId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`메시지 삭제 실패 (${response.status})`);
            }

            console.log('메시지 삭제 성공:', messageId);
            deleteMessage(chatRoomId, messageId, 'deleted');
            return true;
        } catch (error) {
            console.error('메시지 삭제 오류:', error);
            throw error;
        }
    }, [currentUser.userId, isAuthenticated, getAuthHeaders, deleteMessage]);

    // WebSocket 연결
    const connectWebSocket = useCallback((chatRoomId) => {
        if (!chatRoomId || !isAuthenticated || !currentUser.userId) {
            console.error('WebSocket 연결 불가');
            return;
        }

        console.log('WebSocket 연결 시작:', chatRoomId);

        if (websocketRef.current && websocketRef.current.readyState !== WebSocket.CLOSED) {
            websocketRef.current.close(1000, 'New connection');
            websocketRef.current = null;
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = process.env.NODE_ENV === 'production'
            ? window.location.host
            : 'localhost:8080';

        const wsUrl = `${wsProtocol}//${wsHost}/ws/chatroom`;
        console.log('연결 URL:', wsUrl);

        setConnectionStatus('connecting');

        const ws = new WebSocket(wsUrl);
        websocketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket 열림');

            const accessToken = localStorage.getItem('accessToken');
            const connectFrame = `CONNECT
accept-version:1.2
heart-beat:20000,20000
Authorization:Bearer ${accessToken}

\0`;

            ws.send(connectFrame);
        };

        ws.onmessage = (event) => {
            console.log('수신 (첫 100자):', event.data.substring(0, 100));

            if (event.data.startsWith('CONNECTED')) {
                console.log('STOMP 연결 성공');

                const subscribeFrame = `SUBSCRIBE
id:sub-${chatRoomId}
destination:/topic/chat.${chatRoomId}

\0`;

                console.log('구독:', `/topic/chat.${chatRoomId}`);
                ws.send(subscribeFrame);

                setTimeout(async () => {
                    console.log('구독 완료');
                    setConnectionStatus('connected');

                    await fetchChatHistory(chatRoomId);

                    try {
                        const isTokenValid = await checkTokenValidity();
                        if (isTokenValid) {
                            await fetchChatRooms(true);
                        }
                    } catch (err) {
                        console.warn('목록 갱신 실패:', err);
                    }
                }, 500);
            }
            else if (event.data.startsWith('MESSAGE')) {
                const messageData = parseStompMessage(event.data);
                console.log('메시지 수신 원본:', messageData);

                if (messageData) {
                    const formattedMessage = {
                        id: messageData.messageId,
                        content: messageData.content,
                        sender: messageData.writerChatName,
                        senderId: messageData.senderId,
                        timestamp: messageData.createdAt,
                        type: messageData.type === 0 ? 'chat' :
                            messageData.type === 1 ? 'join' : 'leave',
                        replyToMessageId: messageData.replytoMessageId || null  // 답장 기능용
                    };

                    console.log('포맷된 메시지:', formattedMessage);
                    addMessage(chatRoomId, formattedMessage);
                }
            }
            else if (event.data.startsWith('ERROR')) {
                console.error('STOMP ERROR:', event.data);
                setConnectionStatus('error');
            }
        };

        ws.onclose = (event) => {
            console.log('WebSocket 종료:', event.code, event.reason);
            setConnectionStatus('disconnected');

            if (event.code !== 1000 && selectedRoom === chatRoomId) {
                setTimeout(() => {
                    console.log('재연결 시도...');
                    connectWebSocket(chatRoomId);
                }, 3000);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket 오류:', error);
            setConnectionStatus('error');
        };

    }, [isAuthenticated, currentUser.userId, selectedRoom, checkTokenValidity, fetchChatRooms, fetchChatHistory, addMessage]);

    const joinRoom = useCallback((chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            console.error('로그인 필요');
            return;
        }

        console.log('방 입장:', chatRoomId);
        setSelectedRoom(chatRoomId);
        setReplyTo(null);

        setMessages(prev => ({
            ...prev,
            [chatRoomId]: prev[chatRoomId] || []
        }));

        connectWebSocket(chatRoomId);
    }, [connectWebSocket, isAuthenticated, currentUser.userId]);

    useEffect(() => {
        if (isAuthenticated && currentUser.userId && isChatPage) {
            console.log('채팅 페이지 - 목록 로드');
            fetchChatRooms();
        } else if (!isChatPage) {
            setChatRooms([]);
            setMessages({});
            if (selectedRoom) {
                leaveRoom();
            }
        } else if (!isAuthenticated) {
            setChatRooms([]);
            setMessages({});
            if (selectedRoom) {
                leaveRoom();
            }
        }
    }, [isAuthenticated, currentUser.userId, isChatPage, fetchChatRooms, selectedRoom, leaveRoom]);

    useEffect(() => {
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close(1000, 'Unmount');
            }
        };
    }, []);

    const value = {
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
        CATEGORY_MAP,
        getCategoryNameById,
        getCategoryIdByName,
        createChatRoom,
        joinChatRoom,
        leaveChatRoom,
        getChatRoomInfo,
        fetchChatRooms,
        fetchChatHistory,
        verifyRoomPassword,
        createAndJoinRoom,
        editChatRoomName,
        deleteChatRoom,
        createAnnouncement,
        getMainAnnouncement,
        sendMessage,
        requestDeleteMessage,
        joinRoom,
        leaveRoom,
        connectWebSocket
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