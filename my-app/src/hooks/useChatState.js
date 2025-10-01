import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

/**
 * useChatState 커스텀 훅
 * - 백엔드 반환값 Long chatRoomId에 맞춰 데이터 구조 변경 (0923)
 * - AuthContext와 연동하여 로그인한 유저의 채팅방 로딩
 */

// 카테고리 매핑 상수
const CATEGORY_MAP = {
    '일반': { id: 1, name: '일반' },
    '프로젝트': { id: 2, name: '프로젝트' },
    '스터디': { id: 3, name: '스터디' },
    '취미': { id: 4, name: '취미' },
    '기타': { id: 5, name: '기타' }
};

// ID로 카테고리 이름 찾기
const getCategoryNameById = (categoryId) => {
    const category = Object.values(CATEGORY_MAP).find(cat => cat.id === categoryId);
    return category ? category.name : '기타';
};

// 카테고리 이름으로 ID 찾기
const getCategoryIdByName = (categoryName) => {
    const category = CATEGORY_MAP[categoryName];
    return category ? category.id : CATEGORY_MAP['기타'].id;
};

// 채팅 상태를 전역에서 관리할 Context 생성
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

// 테스트 데이터 생성 함수 - ChatRoom 컴포넌트에 맞게 수정
const getTestRooms = (username, isTemporary = false) => {
    return [
        {
            chatRoomId: 10, // 사이드바에서 사용할 ID
            chatRoomName: `${username}님의 테스트 채팅방`,
            roomName: `${username}님의 테스트 채팅방`, // ChatRoom 컴포넌트에서 사용
            name: `${username}님의 테스트 채팅방`,
            currentMembers: 5,
            members: 5, // ChatRoom 컴포넌트에서 사용
            maxMembers: 30,
            isPrivate: false,
            category: CATEGORY_MAP['일반'].id,
            description: 'API 테스트용 채팅방입니다. 클릭하면 채팅방에 입장할 수 있습니다.',
            createdAt: new Date().toISOString(),
        },
    ];
};

// Chat 상태를 제공하는 Provider 컴포넌트
export const ChatStateProvider = ({ children }) => {
    const { user, isAuthenticated, getAuthHeaders } = useAuth();
    const location = useLocation(); // 현재 경로 확인용

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [replyTo, setReplyTo] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const websocketRef = useRef(null);
    const apiCallRef = useRef(null); // API 호출 중복 방지를 위한 Ref

    // AuthContext에서 가져온 유저 정보 사용, 없으면 기본값 사용
    const currentUser = user || {
        userId: null,
        username: '게스트',
        loginId: null
    };

    // 채팅 관련 페이지인지 확인
    const isChatPage = location.pathname.startsWith('/workspace');

    // 지연 함수
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const checkTokenValidity = useCallback(async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error('No access token found');
            return false;
        }

        try {
            // JWT 토큰 만료 확인
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            console.log('Token validity check:', {
                exp: new Date(payload.exp * 1000),
                now: new Date(),
                isExpired,
                userId: payload.userId || payload.sub
            });

            if (isExpired) {
                console.error('Token expired');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }, []);

    // 채팅방 목록 조회 - 실제 API 사용 (테스트 모드 해제)
    const fetchChatRooms = useCallback(async (skipTokenCheck = false) => {
        if (!isAuthenticated || !currentUser.userId) {
            setChatRooms([]);
            return;
        }

        // API 호출 중복 방지
        if (apiCallRef.current) {
            console.log('API call already in progress. Skipping duplicate request.');
            return;
        }

        if (currentUser.isTemporary) {
            console.log('임시 userId 사용 중 - 테스트 데이터만 표시');
            setChatRooms(getTestRooms(currentUser.username, true));
            return;
        }

        // 토큰 유효성 확인 (skipTokenCheck가 false일 때만)
        if (!skipTokenCheck) {
            const isTokenValid = await checkTokenValidity();
            if (!isTokenValid) {
                console.error('Token invalid - cannot fetch chat rooms');
                setChatRooms(getTestRooms(currentUser.username));
                return;
            }
        }

        setIsLoadingRooms(true);
        apiCallRef.current = true;

        console.log(`API call attempt: /api/chat-room/show/${currentUser.userId}/joinlist`);

        try {
            const response = await fetch(`/api/chat-room/show/${currentUser.userId}/joinlist`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('API response status:', response.status);

            if (response.ok) {
                const rooms = await response.json();

                console.log('API에서 채팅방 목록 로드 완료:', rooms.length, 'rooms');
                console.log('첫 번째 방의 데이터 구조:', rooms[0]);
                console.log('모든 방의 키 목록:', rooms.map(room => Object.keys(room)));

                // 백엔드에서 ChatRoomShowDto에 ID가 추가되었으므로 그대로 사용
                const processedRooms = rooms.map(room => ({
                    ...room,
                    // 백엔드 필드명을 프론트엔드에서 사용하는 필드명으로 통일
                    chatRoomName: room.roomName || room.chatRoomName || room.name,
                    currentMembers: room.currentMembers || room.members || 0
                }));

                setChatRooms(processedRooms);
                console.log('처리된 채팅방 목록:', processedRooms);
            } else if (response.status === 403) {
                console.error('403 Forbidden - 토큰 권한 문제');
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));

                const errorText = await response.text().catch(() => 'No response body');
                console.log('Error response body:', errorText);

                const currentToken = localStorage.getItem('accessToken');
                console.log('Current token exists:', !!currentToken);

                if (currentToken) {
                    try {
                        const payload = JSON.parse(atob(currentToken.split('.')[1]));
                        console.log('Token payload:', payload);
                        console.log('Token expires at:', new Date(payload.exp * 1000));
                        console.log('Is token expired:', payload.exp * 1000 < Date.now());
                    } catch (tokenError) {
                        console.error('Token parsing error:', tokenError);
                    }
                }

                // 토큰 새로고침 시도
                if (typeof user?.refreshToken === 'function') {
                    try {
                        console.log('Attempting token refresh...');
                        await user.refreshToken();
                        return fetchChatRooms(true);
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                    }
                }

                console.log('Using test data due to auth failure');
                setChatRooms(getTestRooms(currentUser.username));
            } else {
                console.error('채팅방 목록 조회 실패:', response.status);
                // API 실패 시 테스트 데이터로 대체
                setChatRooms(getTestRooms(currentUser.username));
            }
        } catch (error) {
            console.error('채팅방 목록 조회 오류:', error);
            // 네트워크 오류 시 테스트 데이터로 대체
            setChatRooms(getTestRooms(currentUser.username));
        } finally {
            setIsLoadingRooms(false);
            apiCallRef.current = false;
        }
    }, [currentUser.userId, currentUser.username, currentUser.isTemporary, isAuthenticated, getAuthHeaders, checkTokenValidity, user]);

    // 채팅방 생성 - chatRoomId 반환에 맞게 수정
    const createChatRoom = useCallback(async (roomData) => {
        // 1. 로그인 상태 확인
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            // 2. 요청 데이터 준비 - 단일 카테고리 처리
            let categoryId;

            if (typeof roomData.category === 'string') {
                categoryId = getCategoryIdByName(roomData.category);
            } else if (typeof roomData.category === 'number') {
                categoryId = roomData.category;
            } else {
                categoryId = CATEGORY_MAP['일반'].id; // 기본값
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

            console.log('채팅방 생성 요청 데이터:', requestData);

            // 3. API 호출
            const response = await fetch('/api/chat-room/create', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(requestData)
            });

            // 4. 응답 오류 처리
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '채팅방 생성에 실패했습니다.');
            }

            // 5. 성공 시 응답 데이터 처리 - Long chatRoomId 반환
            const newChatRoomId = await response.json();
            console.log('채팅방 생성 성공, chatRoomId:', newChatRoomId);

            return newChatRoomId;

        } catch (error) {
            console.error('채팅방 생성 오류:', error);
            throw error;
        }
    }, [currentUser.userId, isAuthenticated, getAuthHeaders]);

    // 비밀번호 검증 API 호출 - chatRoomId 파라미터명 변경
    const verifyRoomPassword = useCallback(async (chatRoomId, password) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
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
        } catch (error) {
            console.error('Password verification failed:', error);
            throw error;
        }
    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    // 채팅방 참여 - chatRoomId 파라미터명 변경
    const joinChatRoom = useCallback(async (chatRoomId, chatName = null, retryCount = 0) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        console.log(`JOIN API call start: chatRoomId=${chatRoomId}, userId=${currentUser.userId}, retry=${retryCount}`);

        try {
            const requestData = {
                userId: currentUser.userId,
                chatName: chatName || currentUser.username
            };

            console.log('JOIN API request data:', requestData);
            const url = `/api/chat-room/${chatRoomId}/join`;
            console.log('Request URL:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(requestData)
            });

            console.log(`JOIN API response status: ${response.status}`);

            if (!response.ok) {
                if (response.status === 403) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('403 Forbidden details:', errorData);

                    // 이미 참여중인 경우인지 확인
                    if (errorData.message && errorData.message.includes('이미')) {
                        console.log('이미 참여중인 방 - 성공으로 처리');
                        await fetchChatRooms();
                        return true;
                    }

                    throw new Error('채팅방 참여 권한이 없습니다. (403 Forbidden)');
                }

                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `채팅방 참여에 실패했습니다. (${response.status})`);
            }

            console.log('JOIN API success:', chatRoomId);

            // JOIN 성공 후 목록 새로고침
            await fetchChatRooms();
            return true;

        } catch (error) {
            console.error('JOIN API failed:', error);
            throw error;
        }
    }, [currentUser.userId, currentUser.username, isAuthenticated, getAuthHeaders, fetchChatRooms]);

    // 채팅방 나가기 - chatRoomId 파라미터명 변경
    const leaveChatRoom = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const response = await fetch('/api/chat-room/leave', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    userId: currentUser.userId,
                    roomId: chatRoomId // API에서는 roomId로 받는지 확인 필요
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '채팅방 나가기에 실패했습니다.');
            }

            if (selectedRoom === chatRoomId) {
                leaveRoom();
            }

            await fetchChatRooms();
            return true;
        } catch (error) {
            console.error('Leave chat room error:', error);
            throw error;
        }
    }, [currentUser.userId, isAuthenticated, getAuthHeaders, selectedRoom, fetchChatRooms]);

    // 채팅방 정보 조회 - chatRoomId 파라미터명 변경
    const getChatRoomInfo = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const response = await fetch(`/api/chat-room/show/${chatRoomId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `채팅방 정보 조회 실패 (${response.status})`);
            }

            const roomInfo = await response.json();
            console.log('채팅방 정보 조회 성공:', roomInfo);
            return roomInfo;
        } catch (error) {
            console.error('채팅방 정보 조회 오류:', error);
            throw error;
        }
    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    // 채팅방 이름 수정
    const editChatRoomName = useCallback(async (chatRoomId, roomName, description = null) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const requestData = {
                roomName: roomName.trim()
            };

            if (description !== null) {
                requestData.description = description.trim();
            }

            const response = await fetch(`/api/chat-room/${chatRoomId}/edit`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '채팅방 정보 수정에 실패했습니다.');
            }

            // 수정 후 채팅방 목록 새로고침
            await fetchChatRooms();
            return true;

        } catch (error) {
            console.error('채팅방 정보 수정 오류:', error);
            throw error;
        }
    }, [isAuthenticated, currentUser.userId, getAuthHeaders, fetchChatRooms]);

    // 채팅방 삭제
    const deleteChatRoom = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const response = await fetch(`/api/chat-room/${chatRoomId}/delete`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '채팅방 삭제에 실패했습니다.');
            }

            // 현재 선택된 방이 삭제된 방이면 나가기
            if (selectedRoom === chatRoomId) {
                leaveRoom();
            }

            // 삭제 후 채팅방 목록 새로고침
            await fetchChatRooms();
            return true;

        } catch (error) {
            console.error('채팅방 삭제 오류:', error);
            throw error;
        }
    }, [isAuthenticated, currentUser.userId, getAuthHeaders, selectedRoom, fetchChatRooms]);

    // 공지 생성
    const createAnnouncement = useCallback(async (chatRoomId, content) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const requestData = {
                userId: currentUser.userId,
                chatName: currentUser.username || currentUser.chatName,
                content: content.trim()
            };

            const response = await fetch(`/api/chat-room/${chatRoomId}/announcement/create`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '공지 생성에 실패했습니다.');
            }

            const announcementId = await response.json();
            console.log('공지 생성 성공:', announcementId);
            return announcementId;

        } catch (error) {
            console.error('공지 생성 오류:', error);
            throw error;
        }
    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    // 공지 조회
    const getMainAnnouncement = useCallback(async (chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            const response = await fetch(`/api/chat-room/${chatRoomId}/announcement/show/main`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '공지 조회에 실패했습니다.');
            }

            const announcement = await response.json();
            console.log('공지 조회 성공:', announcement);
            return announcement;

        } catch (error) {
            console.error('공지 조회 오류:', error);
            throw error;
        }
    }, [isAuthenticated, currentUser.userId, getAuthHeaders]);

    // 채팅방 생성 후 자동 참여 및 입장 - 백엔드에서 자동 JOIN 처리하므로 수정
    const createAndJoinRoom = useCallback(async (roomData) => {
        console.log('=== 채팅방 생성 및 자동 입장 프로세스 시작 ===');

        try {
            // 1. 채팅방 생성
            const newChatRoomId = await createChatRoom(roomData);
            console.log('채팅방 생성 완료, chatRoomId:', newChatRoomId);

            // 2. JOIN API 호출
            console.log('JOIN API 호출 시도...');
            const joinResult = await joinChatRoom(newChatRoomId);

            // 3. 참여 성공 여부 확인
            if (joinResult) {
                console.log('채팅방 참여 성공');
                return { roomId: newChatRoomId, success: true };
            } else {
                throw new Error('채팅방 참여에 실패했습니다.');
            }

        } catch (error) {
            console.error('=== 채팅방 생성 및 입장 실패 ===');
            console.error('Error:', error.message);
            throw error;
        }
    }, [createChatRoom, joinChatRoom]);

    // 채팅 히스토리 로드 - connectWebSocket보다 먼저 선언
    const fetchChatHistory = useCallback(async (chatRoomId) => {
        if (!chatRoomId) {
            console.error('fetchChatHistory: chatRoomId가 없습니다:', chatRoomId);
            return;
        }

        try {
            console.log('채팅 히스토리 로드 시도, chatRoomId:', chatRoomId);

            const response = await fetch(`/api/chatroom/message/showlist/${chatRoomId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const messages = await response.json();

                const formattedMessages = messages.map(msg => ({
                    id: msg.messageId,
                    content: msg.content,
                    sender: msg.writerChatName,
                    // username 비교로 본인 메시지 판별
                    senderId: msg.writerChatName === currentUser.username
                        ? currentUser.userId
                        : undefined,
                    timestamp: msg.createdAt,
                    type: msg.type === 0 ? 'chat' :
                        msg.type === 1 ? 'join' : 'leave'
                }));

                setMessages(prev => ({
                    ...prev,
                    [chatRoomId]: formattedMessages
                }));

                console.log('채팅 히스토리 로드 완료:', formattedMessages.length, 'messages');
            } else {
                console.error('채팅 히스토리 조회 실패:', response.status);
            }
        } catch (error) {
            console.error('채팅 히스토리 조회 실패:', error);
        }
    }, [getAuthHeaders, currentUser.username, currentUser.userId]);

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
                console.log(`${data.username} joined the room`);
                break;
            case 'user_left':
                console.log(`${data.username} left the room`);
                break;
            case 'room_updated':
                fetchChatRooms();
                break;
            case 'error':
                console.error('Server error:', data.message);
                setConnectionStatus('error');
                break;
            default:
                console.log('Unknown message type:', data);
        }
    }, [fetchChatRooms]);

    // 메시지 추가
    const addMessage = useCallback((chatRoomId, message) => {
        setMessages(prev => ({
            ...prev,
            [chatRoomId]: [...(prev[chatRoomId] || []), message]
        }));
    }, []);

    // 메시지 삭제
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

    // STOMP 메시지 전송 - senderId, replyTo 추가
    const sendMessage = useCallback((chatRoomId, content, replyToId = null) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const ws = websocketRef.current;
        const replyToMessage = replyToId ? messages[chatRoomId]?.find(m => m.id === replyToId) : null;

        if (ws && ws.readyState === WebSocket.OPEN && connectionStatus === 'connected') {
            // API 명세에 맞게 수정: communityId 사용
            const messageData = {
                chatRoomId: parseInt(chatRoomId),
                content: content,
                communityId: currentUser.userId, // API 명세에 따라 communityId 사용
                replyToMessageId: replyToId
            };

            const sendFrame = `SEND
destination:/app/chat.${chatRoomId}.sendMessage
content-type:application/json

${JSON.stringify(messageData)}\0`;

            console.log('STOMP 메시지 전송:', messageData);
            ws.send(sendFrame);

            // 클라이언트에서 즉시 메시지 추가 (낙관적 업데이트)
            // 서버에서 브로드캐스트되면 중복 체크는 addMessage에서 처리
            const optimisticMessage = {
                id: `temp-${Date.now()}`, // 임시 ID (서버 응답으로 교체됨)
                content: content,
                sender: currentUser.username,
                senderId: currentUser.userId, // 프론트에서 추가하여 본인 메시지 판별
                timestamp: new Date().toISOString(),
                type: 'chat',
                replyTo: replyToMessage,
                isPending: true // 전송 중 표시용
            };

            addMessage(chatRoomId, optimisticMessage);

        } else {
            console.warn(`STOMP WebSocket 연결 안됨 (상태: ${connectionStatus}, readyState: ${ws?.readyState})`);

            // 테스트 메시지 추가
            const testMessage = {
                id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: content,
                sender: currentUser.username,
                senderId: currentUser.userId,
                timestamp: new Date().toISOString(),
                type: 'chat',
                replyTo: replyToMessage
            };

            addMessage(chatRoomId, testMessage);
        }
    }, [currentUser.userId, currentUser.username, isAuthenticated, connectionStatus, messages, addMessage]);
    // 메시지 삭제 요청 - chatRoomId에 맞게 수정
    const requestDeleteMessage = useCallback((chatRoomId, messageId) => {
        if (!isAuthenticated || !currentUser.userId) {
            throw new Error('로그인이 필요합니다.');
        }

        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            const deleteData = {
                type: 'delete_message',
                roomId: chatRoomId,
                messageId,
                userId: currentUser.userId
            };
            websocketRef.current.send(JSON.stringify(deleteData));
        } else {
            console.error('WebSocket is not connected');
            throw new Error('채팅 서버에 연결되지 않았습니다.');
        }
    }, [currentUser.userId, isAuthenticated]);

    // STOMP WebSocket 연결 - chatRoomId에 맞게 수정
    const connectWebSocket = useCallback((chatRoomId) => {
        if (!chatRoomId) {
            console.error('connectWebSocket: chatRoomId가 없습니다:', chatRoomId);
            return;
        }

        if (!isAuthenticated || !currentUser.userId) {
            console.error('WebSocket 연결을 위해 로그인이 필요합니다');
            return;
        }

        console.log('WebSocket 연결 시도, chatRoomId:', chatRoomId);

        // 기존 연결 정리
        if (websocketRef.current && websocketRef.current.readyState !== WebSocket.CLOSED) {
            websocketRef.current.close(1000, 'New connection requested');
            websocketRef.current = null;
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = process.env.NODE_ENV === 'production'
            ? window.location.host
            : 'localhost:8080';

        const wsUrl = `${wsProtocol}//${wsHost}/ws/chatroom`;

        console.log('STOMP WebSocket 연결 시도:', wsUrl, 'chatRoomId:', chatRoomId);

        // 연결 중 상태로 먼저 설정
        setConnectionStatus('connecting');

        const ws = new WebSocket(wsUrl);
        websocketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket 연결됨, STOMP CONNECT 프레임 전송 중...');

            const accessToken = localStorage.getItem('accessToken');
            const connectFrame = `CONNECT
accept-version:1.2
heart-beat:20000,20000
Authorization:Bearer ${accessToken}

\0`;

            ws.send(connectFrame);
        };

        ws.onmessage = (event) => {
            console.log('STOMP 메시지 수신 (raw):', event.data);

            // CONNECTED 프레임 처리
            if (event.data.startsWith('CONNECTED')) {
                console.log('✅ STOMP 연결 성공!');
                setConnectionStatus('connected');

                // 구독 프레임 전송
                const subscribeFrame = `SUBSCRIBE
id:sub-${chatRoomId}
destination:/topic/chat.${chatRoomId}

\0`;

                console.log('구독 프레임 전송:', `/topic/chat.${chatRoomId}`);
                ws.send(subscribeFrame);

                // 채팅 히스토리 로드
                fetchChatHistory(chatRoomId);

                // 채팅방 목록 갱신
                setTimeout(async () => {
                    console.log('WebSocket 연결 후 채팅방 목록 갱신 시도...');
                    try {
                        const isTokenValid = await checkTokenValidity();
                        if (isTokenValid) {
                            await fetchChatRooms(true);
                        }
                    } catch (refreshError) {
                        console.warn('Room list refresh failed:', refreshError);
                    }
                }, 1000);

            }
            // MESSAGE 프레임 처리
            else if (event.data.startsWith('MESSAGE')) {
                const messageData = parseStompMessage(event.data);
                console.log('파싱된 메시지:', messageData);

                if (messageData) {
                    const formattedMessage = {
                        id: messageData.messageId,
                        content: messageData.content,
                        sender: messageData.writerChatName,
                        // 백엔드가 senderId를 반환하면 사용, 아니면 undefined
                        senderId: messageData.senderId || messageData.communityId,
                        timestamp: messageData.createdAt,
                        type: messageData.type === 0 ? 'chat' :
                            messageData.type === 1 ? 'join' : 'leave'
                    };

                    console.log('포맷된 메시지 추가:', formattedMessage);
                    addMessage(chatRoomId, formattedMessage);
                }
            }
            // ERROR 프레임 처리
            else if (event.data.startsWith('ERROR')) {
                console.error('STOMP ERROR 프레임 수신:', event.data);
                setConnectionStatus('error');
            }
        };

        ws.onclose = (event) => {
            console.log('STOMP WebSocket 연결 종료:', event.code, event.reason);
            setConnectionStatus('disconnected');

            // 정상 종료가 아니고 현재 방이 선택된 경우 재연결 시도
            if (event.code !== 1000 && selectedRoom === chatRoomId) {
                setTimeout(() => {
                    console.log('STOMP WebSocket 재연결 시도...');
                    connectWebSocket(chatRoomId);
                }, 3000);
            }
        };

        ws.onerror = (error) => {
            console.error('STOMP WebSocket error:', error);
            setConnectionStatus('error');
        };

    }, [isAuthenticated, currentUser.userId, currentUser.username, selectedRoom, checkTokenValidity, fetchChatRooms, fetchChatHistory, addMessage]);


    // 방 입장 - chatRoomId에 맞게 수정
    const joinRoom = useCallback((chatRoomId) => {
        if (!isAuthenticated || !currentUser.userId) {
            console.error('Login required for room entry');
            return;
        }

        console.log('Entering room with chatRoomId:', chatRoomId);
        setSelectedRoom(chatRoomId);
        setReplyTo(null);

        setMessages(prev => ({
            ...prev,
            [chatRoomId]: prev[chatRoomId] || []
        }));

        connectWebSocket(chatRoomId);
    }, [connectWebSocket, isAuthenticated, currentUser.userId]);

    // 방 나가기
    const leaveRoom = useCallback(() => {
        console.log('Leaving room');
        if (websocketRef.current) {
            websocketRef.current.close(1000, 'User left room');
        }
        setSelectedRoom(null);
        setReplyTo(null);
        setConnectionStatus('disconnected');
    }, []);

    // 로그인 상태 변경 시 채팅방 목록 조건부 로딩
    useEffect(() => {
        if (isAuthenticated && currentUser.userId && isChatPage) {
            console.log('Chat page detected - loading chat room list');
            fetchChatRooms();
        } else if (!isChatPage) {
            // 채팅 페이지가 아니면 상태 초기화 (메모리 절약)
            setChatRooms([]);
            setMessages({});
            if (selectedRoom) {
                leaveRoom();
            }
        } else if (!isAuthenticated) {
            // 로그아웃 시 모든 상태 초기화
            setChatRooms([]);
            setMessages({});
            if (selectedRoom) {
                leaveRoom();
            }
        }
    }, [isAuthenticated, currentUser.userId, isChatPage, fetchChatRooms, selectedRoom, leaveRoom]);

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

        // 카테고리 관련 유틸리티
        CATEGORY_MAP,
        getCategoryNameById,
        getCategoryIdByName,

        // 채팅방 관리 함수
        createChatRoom,
        joinChatRoom,
        leaveChatRoom,
        getChatRoomInfo,
        fetchChatRooms,
        fetchChatHistory,
        verifyRoomPassword,
        createAndJoinRoom, // 통합 함수
        editChatRoomName,
        deleteChatRoom,

        // 공지 관리 함수
        createAnnouncement,
        getMainAnnouncement,

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