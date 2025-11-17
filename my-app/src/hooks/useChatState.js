import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';
import { useLocation } from 'react-router-dom';

/**
 * useChatState 커스텀 훅
 * - 채팅방 목록 및 CRUD 관리
 * - AuthContext와 연동하여 로그인한 유저의 채팅방 로딩
 * - 메시지 히스토리 URL: /api/chatroom/{chatRoomId}/show
 * - 참여자 및 공지사항 관리
 * - WebSocket 로직은 WebSocketContext로 분리
 * - reconnectWebSocket 함수 추가
 * - replyMessageId 지원
 * - 입장/퇴장 시스템 메시지
 * - 5분 기준 메시지 삭제 (REST API)
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

export const ChatStateProvider = ({ children }) => {
    const { user, isAuthenticated, getAuthHeaders } = useAuth();
    const {
        connectionStatus,
        reconnectAttempts,
        connect,
        disconnect,
        reconnect: wsReconnect,
        sendMessage: wsSendMessage,
        deleteMessage: wsDeleteMessage,
        addMessageHandler,
        addDeleteHandler
    } = useWebSocket();
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
                setCommunityNickname(nickname);
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
    const fetchChatRooms = useCallback(async () => {
        if (!isAuthenticated || !currentUser.userId) {
            setChatRooms([]);
            return;
        }

        if (apiCallRef.current) {
            console.log('API call in progress, skipping');
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
                console.log('백엔드 원본 응답:', rooms);

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
            }
        } catch (error) {
            console.error('채팅방 목록 조회 오류:', error);
        } finally {
            setIsLoadingRooms(false);
            apiCallRef.current = false;
        }
    }, [currentUser.userId, currentUser.username, currentUser.isTemporary, isAuthenticated, getAuthHeaders, checkTokenValidity, user]);

    // 메시지 추가 (내부 사용) - 시간순 정렬 유지
    const addMessage = useCallback((chatRoomId, message) => {
        setMessages(prev => {
            const currentMessages = prev[chatRoomId] || [];
            const newMessages = [...currentMessages, message];

            // 시간순으로 정렬 (오래된 메시지가 위로)
            const sortedMessages = newMessages.sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                return timeA - timeB;
            });

            return {
                ...prev,
                [chatRoomId]: sortedMessages
            };
        });
    }, []);

    // WebSocket으로 받은 메시지 삭제 이벤트 처리
    const handleDeletedMessage = useCallback((chatRoomId, messageId) => {
        const targetId = Number(messageId);

        // 메시지 ID가 유효하지 않으면 (ex: NaN) 처리하지 않습니다.
        if (isNaN(targetId) || targetId <= 0) {
            console.warn('유효하지 않은 messageId로 삭제 이벤트를 무시합니다:', messageId);
            return;
        }
        setMessages(prev => {
            const currentMessages = prev[chatRoomId] || [];

            const updatedMessages = currentMessages.map(msg => {
                if (Number(msg.id) === targetId) {
                    return {
                        ...msg,
                        isDeleted: true,
                        content: '삭제된 메시지입니다.'
                    };
                }
                return msg;
            });

            // ... (나머지 불변성 로직)
            return {
                ...prev,
                [chatRoomId]: updatedMessages
            };
        });
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

                const formattedMessages = msgs.map(msg => {
                    // type: 0=일반메시지, 1=입장, 2=퇴장
                    let messageType = 'chat';
                    let messageContent = msg.content;

                    if (msg.type === 1) {
                        messageType = 'system';
                        messageContent = `${msg.writerChatName}님이 입장하셨습니다.`;
                    } else if (msg.type === 2) {
                        messageType = 'system';
                        messageContent = `${msg.writerChatName}님이 퇴장하셨습니다.`;
                    } else if (msg.isDeleted) {
                        messageContent = '삭제된 메시지입니다.';
                    }

                    return {
                        id: msg.messageId,
                        content: messageContent,
                        sender: msg.writerChatName,
                        senderId: msg.senderId,
                        timestamp: msg.createdAt,
                        type: messageType,
                        replyToMessageId: msg.replytoMessageId || msg.replyMessageId || null,
                        replyMessageId: msg.replytoMessageId || msg.replyMessageId || null,
                        isDeleted: msg.isDeleted || false
                    };
                });

                // 시간순으로 정렬 (오래된 메시지가 위로)
                const sortedMessages = formattedMessages.sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();
                    return timeA - timeB;
                });

                setMessages(prev => ({
                    ...prev,
                    [chatRoomId]: sortedMessages
                }));

                console.log('히스토리 로드 완료:', sortedMessages.length);
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

        console.log('JOIN API 호출');
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
                    // throw new Error(errorData.message || '채팅방 참여 권한이 없습니다.');
                }
                // throw new Error('채팅방 참여에 실패했습니다.');
            }

            // 로컬에서 입장 시스템 메시지 전송 코드 삭제

            await fetchChatRooms();
            return true;
        } catch (error) {
            console.error('JOIN API 에러:', error);
            throw error;
        }
    }, [currentUser.userId, currentUser.communityNickname, currentUser.username, isAuthenticated, getAuthHeaders, fetchChatRooms, addMessage]);

    // 채팅방 나가기 (UI 상태만 정리)
    const leaveRoom = useCallback(() => {
        console.log('방 나가기 (UI 정리)');
        disconnect();
        setSelectedRoom(null);
        setReplyTo(null);
    }, [disconnect]);

    // 채팅방 나가기 (서버에서 나가기)
    const leaveChatRoom = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        console.log('Request URL:', `/api/chat-room/${chatRoomId}/leave`);
        console.log('Headers:', getAuthHeaders());

        // 퇴장 메시지 백엔드에서 전송되므로 로컬 추가 코드 삭제

        const response = await fetch(`/api/chat-room/${chatRoomId}/leave`, {
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
            throw new Error(data.message || '채팅방 나가기에 실패했습니다.');
        }

        if (selectedRoom === chatRoomId) {
            leaveRoom();
        }

        await fetchChatRooms();
        return true;
    }, [currentUser.userId, currentUser.communityNickname, currentUser.username, isAuthenticated, getAuthHeaders, selectedRoom, fetchChatRooms, leaveRoom, addMessage]);

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
                // throw new Error('서버 응답 형식이 올바르지 않습니다.');
            }

            const text = await response.text();
            console.log('참여자 목록 API 응답 본문:', text);

            if (!text || text.trim() === '') {
                console.error('빈 응답 받음');
                return [];
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

    // 메시지 전송 (WebSocket 사용) - replyMessageId 지원
    const sendMessage = useCallback((chatRoomId, content, replyMessageId = null) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        // replyMessageId가 있으면 해당 메시지 찾기
        const replyToMessage = replyMessageId ? messages[chatRoomId]?.find(m => m.id === replyMessageId) : null;

        console.log('메시지 전송:', {
            chatRoomId,
            content,
            replyMessageId,
            replyToMessage: replyToMessage ? { id: replyToMessage.id, sender: replyToMessage.sender } : null
        });

        // WebSocket으로 메시지 전송 (Optimistic UI 없이)
        const sent = wsSendMessage(chatRoomId, content, currentUser.userId, replyMessageId);

        if (!sent) {
            console.warn('WebSocket 미연결 - 테스트 메시지 추가');

            // WebSocket 미연결 시에만 테스트 메시지 추가
            const testMessage = {
                id: `test-${Date.now()}`,
                content: content,
                sender: currentUser.communityNickname || currentUser.username,
                senderId: currentUser.userId,
                timestamp: new Date().toISOString(),
                type: 'chat',
                replyToMessageId: replyMessageId,
                replyMessageId: replyMessageId,
                replyTo: replyToMessage
            };

            addMessage(chatRoomId, testMessage);
        }
    }, [currentUser.userId, currentUser.username, currentUser.communityNickname, isAuthenticated, messages, wsSendMessage, addMessage]);

    // 메시지 삭제 (ws 사용)
    const requestDeleteMessage = useCallback(async (chatRoomId, messageId, canDeleteForEveryone) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            console.log('메시지 삭제 요청 (WebSocket):', {
                chatRoomId,
                messageId,
                canDeleteForEveryone
            });

            if (canDeleteForEveryone) {
                // 5분 이내 - WebSocket으로 모두에게서 삭제
                const sent = wsDeleteMessage(chatRoomId, messageId, currentUser.userId);
                if (!sent) {
                    throw new Error('WebSocket 연결이 끊어졌습니다. 다시 연결해주세요.');
                }

                console.log('메시지 삭제 WebSocket 전송 완료');

                // 로컬에서도 즉시 삭제된 상태로 표시 (Optimistic UI)
                setMessages(prev => ({
                    ...prev,
                    [chatRoomId]: prev[chatRoomId]?.map(msg =>
                        msg.id === messageId
                            ? { ...msg, isDeleted: true, content: '삭제된 메시지입니다.' }
                            : msg
                    ) || []
                }));
            } else {
                // 5분 경과 - 나에게서만 삭제 (로컬에서만 제거)
                setMessages(prev => ({
                    ...prev,
                    [chatRoomId]: prev[chatRoomId]?.filter(msg => msg.id !== messageId) || []
                }));
                console.log('나에게서만 삭제 완료 (로컬)');
            }

            return true;
        } catch (error) {
            console.error('메시지 삭제 오류:', error);
            throw error;
        }
    }, [currentUser.userId, isAuthenticated, wsDeleteMessage]);

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

    // WebSocket 재연결 함수 (외부 노출용)
    const reconnectWebSocket = useCallback(() => {
        console.log('WebSocket 재연결 요청 (useChatState)');
        wsReconnect();
    }, [wsReconnect]);

    // WebSocket 메시지 핸들러 등록
    useEffect(() => {
        const handleMessage = (message) => {
            if (selectedRoom) {
                // WebSocket으로 받은 메시지 처리
                let processedMessage = {
                    ...message,
                    replyToMessageId: message.replyMessageId || message.replyToMessageId || null
                };

                // 시스템 메시지 처리 (입장/퇴장)
                if (message.type === 1) {
                    processedMessage = {
                        ...processedMessage,
                        type: 'system',
                        content: `${message.sender}님이 입장하셨습니다.`
                    };
                } else if (message.type === 3) {
                    processedMessage = {
                        ...processedMessage,
                        type: 'system',
                        content: `${message.sender}님이 퇴장하셨습니다.`
                    };
                }

                addMessage(selectedRoom, processedMessage);
            }
        };

        const unsubscribe = addMessageHandler(handleMessage);

        return () => {
            unsubscribe();
        };
    }, [selectedRoom, addMessageHandler, addMessage]);

    // WebSocket 삭제 이벤트 핸들러 등록
    useEffect(() => {
        const handleDelete = (deleteEvent) => {
            const isSameRoom = selectedRoom &&
                Number(selectedRoom) === Number(deleteEvent.chatRoomId);

            if (isSameRoom) {
                // handleDeletedMessage가 호출됩니다.
                handleDeletedMessage(selectedRoom, deleteEvent.messageId);
            } else {
                console.log(`is SameRoom 조건 실패. selectedRoom: ${selectedRoom}, event.chatRoomId: ${deleteEvent.chatRoomId}`);
            }
        };

        const unsubscribe = addDeleteHandler(handleDelete);

        return () => {
            unsubscribe();
        };
    }, [selectedRoom, addDeleteHandler, handleDeletedMessage]);

    // 채팅 페이지 진입 시 처리
    useEffect(() => {
        if (isAuthenticated && currentUser.userId && isChatPage) {
            console.log('채팅 페이지 진입');
            fetchCommunityNickname();
            fetchChatRooms();
        }
    }, [isAuthenticated, currentUser.userId, isChatPage, fetchChatRooms, fetchCommunityNickname]);

    // 로그아웃 시에만 연결 해제
    useEffect(() => {
        if (!isAuthenticated && selectedRoom) {
            console.log('로그아웃 감지 - WebSocket 연결 해제');
            leaveRoom();
            setChatRooms([]);
            setMessages({});
        }
    }, [isAuthenticated, selectedRoom, leaveRoom]);

    const value = {
        selectedRoom,
        setSelectedRoom,
        chatRooms,
        setChatRooms,
        currentUser,
        messages,
        setMessages,
        connectionStatus,
        reconnectAttempts,
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
        fetchCommunityNickname,
        reconnectWebSocket,
        handleDeletedMessage
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