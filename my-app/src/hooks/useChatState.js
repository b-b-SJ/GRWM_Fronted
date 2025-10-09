import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';
import { useLocation } from 'react-router-dom';

/**
 * useChatState 커스텀 훅
 * - 채팅방 목록 및 CRUD 관리
 * - AuthContext와 연동하여 로그인한 유저의 채팅방 로딩
 * - 메시지 히스토리 URL 수정: /api/chatroom/{chatRoomId}/show (0930)
 * - 참여자 및 공지사항 관리
 * - WebSocket 로직은 WebSocketContext로 분리
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
    const { connectionStatus, connect, disconnect, sendMessage: wsSendMessage, addMessageHandler } = useWebSocket();
    const location = useLocation();

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState({});
    const [replyTo, setReplyTo] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [communityNickname, setCommunityNickname] = useState(null);

    const apiCallRef = useRef(null);

    const currentUser = user || {
        userId: null,
        username: '게스트',
        loginId: null,
        communityNickname: communityNickname || '게스트'
    };

    const isChatPage = location.pathname.startsWith('/workspace');

    // 커뮤니티 닉네임 가져오기
    const fetchCommunityNickname = useCallback(async () => {
        if (!isAuthenticated || !currentUser.userId) {
            return;
        }
        try {
            const response = await fetch('/api/users/community/info', {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                const nickname = data.nickname;

                console.log('커뮤니티 정보:', data);
                setCommunityNickname(nickname);
                console.log('커뮤니티 닉네임 상태:', nickname);
                return nickname;
            } else {
                console.error('커뮤니티 정보 조회 실패:', response.status);
                setCommunityNickname(null);
                return null;
            }
        } catch (error) {
            console.error('커뮤니티 정보 조회 오류:', error);
            setCommunityNickname(null);
            return null;
        }
    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    // 토큰 유효성 확인
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

    // 채팅방 목록 조회
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
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.ok) {
                const rooms = await response.json();
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

    // 메시지 추가 (내부 사용)
    const addMessage = useCallback((chatRoomId, message) => {
        setMessages(prev => ({
            ...prev,
            [chatRoomId]: [...(prev[chatRoomId] || []), message]
        }));
    }, []);

    // 메시지 삭제 (내부 사용)
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

    // 채팅 히스토리 로드
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
                    replyToMessageId: msg.replytoMessageId || null
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

    // 채팅방 생성
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

    // 비밀번호 확인
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

    // 채팅방 참여
    const joinChatRoom = useCallback(async (chatRoomId, chatName = null, isManager = false) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const finalChatName = chatName || currentUser.communityNickname || currentUser.username || '사용자';

        const requestData = {
            userId: currentUser.userId,
            chatName: finalChatName,
            isManager: isManager
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
    }, [currentUser.userId, currentUser.communityNickname, currentUser.username, isAuthenticated, getAuthHeaders, fetchChatRooms]);

    // 채팅방 나가기 (UI 상태만 정리)
    const leaveRoom = useCallback(() => {
        console.log('방 나가기 (UI 정리)');
        disconnect();
        setSelectedRoom(null);
        setReplyTo(null);
    }, [disconnect]);

    // 채팅방 탈퇴 (서버에서 나가기)
    const leaveChatRoom = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        console.log('Request URL:', `/api/chat-room/${chatRoomId}/leave`);
        console.log('Headers:', getAuthHeaders());

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

    // 채팅방 정보 조회
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

    // 채팅방 이름/설명 수정
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

    // 채팅방 삭제
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

    // 공지사항 생성
    const createAnnouncement = useCallback(async (chatRoomId, content) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const chatName = currentUser.communityNickname || currentUser.username || '사용자';

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
    }, [isAuthenticated, currentUser.communityNickname, currentUser.userId, currentUser.username, getAuthHeaders]);

    // 메인 공지사항 조회
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

    // 채팅방 참여자 목록 조회
    const getChatRoomMembers = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const response = await fetch(`/api/chat-room/${chatRoomId}/users`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('참여자 목록 API 응답 상태:', response.status);
            console.log('참여자 목록 API 응답 헤더:', response.headers.get('content-type'));

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('응답이 JSON 형식이 아닙니다:', contentType);
                throw new Error('서버 응답 형식이 올바르지 않습니다.');
            }

            const text = await response.text();
            console.log('참여자 목록 API 응답 본문:', text);

            if (!text || text.trim() === '') {
                console.error('빈 응답 받음');
                return [];
            }

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = JSON.parse(text);
                } catch (e) {
                    console.error('에러 응답 파싱 실패:', e);
                }
                throw new Error(errorData.message || `참여자 목록 조회 실패 (${response.status})`);
            }

            const members = JSON.parse(text);
            console.log('파싱된 참여자 목록:', members);
            return Array.isArray(members) ? members : [];
        } catch (error) {
            console.error('getChatRoomMembers 오류:', error);
            throw error;
        }
    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    // 채팅방 생성 후 참여
    const createAndJoinRoom = useCallback(async (roomData) => {
        const newChatRoomId = await createChatRoom(roomData);
        const joinResult = await joinChatRoom(newChatRoomId, null, true);

        if (joinResult) {
            return { chatRoomId: newChatRoomId, success: true };
        } else {
            throw new Error('채팅방 참여에 실패했습니다.');
        }
    }, [createChatRoom, joinChatRoom]);

    // 메시지 전송 (WebSocket 사용)
    const sendMessage = useCallback((chatRoomId, content, replyToId = null) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const replyToMessage = replyToId ? messages[chatRoomId]?.find(m => m.id === replyToId) : null;

        // WebSocket으로 메시지 전송 시도
        const sent = wsSendMessage(chatRoomId, content, currentUser.userId, replyToId);

        if (sent) {
            // Optimistic UI 업데이트
            const optimisticMessage = {
                id: `temp-${Date.now()}`,
                content: content,
                sender: currentUser.communityNickname || currentUser.username,
                senderId: currentUser.userId,
                timestamp: new Date().toISOString(),
                type: 'chat',
                replyToMessageId: replyToId,
                replyTo: replyToMessage,
                isPending: true
            };
        } else {
            console.warn(' WebSocket 미연결');

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
    }, [currentUser.userId, currentUser.username, currentUser.communityNickname, isAuthenticated, messages, wsSendMessage, addMessage]);

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

    // 채팅방 입장 (WebSocket 연결 + 히스토리 로드)
    const joinRoom = useCallback(async (chatRoomId) => {
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

        // WebSocket 연결
        connect(chatRoomId);

        // 히스토리 로드
        await fetchChatHistory(chatRoomId);

        // 채팅방 목록 갱신
        try {
            const isTokenValid = await checkTokenValidity();
            if (isTokenValid) {
                await fetchChatRooms(true);
            }
        } catch (err) {
            console.warn('목록 갱신 실패:', err);
        }
    }, [connect, isAuthenticated, currentUser.userId, fetchChatHistory, checkTokenValidity, fetchChatRooms]);

    // WebSocket 메시지 핸들러 등록
    useEffect(() => {
        const handleMessage = (message) => {
            if (selectedRoom) {
                addMessage(selectedRoom, message);
            }
        };

        const unsubscribe = addMessageHandler(handleMessage);

        return () => {
            unsubscribe();
        };
    }, [selectedRoom, addMessageHandler, addMessage]);

    // 초기 로드 및 페이지 전환 처리
    useEffect(() => {
        if (isAuthenticated && currentUser.userId && isChatPage) {
            fetchCommunityNickname();
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
    }, [isAuthenticated, currentUser.userId, isChatPage, fetchChatRooms, fetchCommunityNickname, selectedRoom, leaveRoom]);

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
        getChatRoomMembers,
        sendMessage,
        requestDeleteMessage,
        joinRoom,
        leaveRoom,
        fetchCommunityNickname
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