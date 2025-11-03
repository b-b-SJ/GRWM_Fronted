import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useStudyRoomWebSocket } from './StudyRoomWebSocketContext';

/**
 * useStudyRoomState 커스텀 훅 (WebSocket 통합)
 * - 스터디룸 관련 상태 관리 및 API 통신
 * - REST API: 스터디룸 생성, 조회, 참여, 퇴장 / To-do CRUD 및 완료 처리
 * - WebSocket: To-do, 리액션, 투표, 참여자 실시간 동기화
 */

export const useStudyRoomState = () => {
    const { isAuthenticated, user } = useAuth();

    const {
        connectionStatus,
        connect: connectWebSocket,
        disconnect: disconnectWebSocket,
        addTodoHandler,
        addReactionHandler,
        addVoteHandler,
        addRoomHandler
    } = useStudyRoomWebSocket();

    // 스터디룸 상태
    const [studyRooms, setStudyRooms] = useState([]);
    const [currentStudyRoom, setCurrentStudyRoom] = useState(null);
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 페이지네이션 상태
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElement: 0
    });

    const currentUser = user || {
        userId: null,
        username: '게스트',
        loginId: null
    };

    // ========== API 유틸리티 ==========

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }, []);

    const handleApiError = useCallback((error, context) => {
        console.error(`API 오류 (${context}):`, error);

        let errorMessage = '요청 처리 중 오류가 발생했습니다.';

        if (error.response) {
            errorMessage = error.response.data?.message || `서버 오류 (${error.response.status})`;
        } else if (error.request) {
            errorMessage = '서버 응답이 없습니다. 네트워크를 확인해주세요.';
        } else {
            errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
        }

        setError(errorMessage);
        return null;
    }, []);

    // ========== WebSocket 이벤트 핸들러 ==========

    useEffect(() => {
        // To-do 이벤트 핸들러
        const removeTodoHandler = addTodoHandler((event) => {
            console.log('Todo 이벤트 수신:', event);

            const receivedTodo = event.data;

            const mappedTodo = {
                ...receivedTodo,
                content: receivedTodo.title,
                userId: receivedTodo.creatorId
            };

            switch (event.type) {
                case 'TODO_CREATED':
                    setTodos(prev => {
                        // 중복 체크
                        if (prev.some(todo => todo.todoId === mappedTodo.todoId)) {
                            return prev;
                        }
                        return [...prev, mappedTodo];
                    });
                    break;
                case 'TODO_UPDATED':
                    setTodos(prev => prev.map(todo =>
                        todo.todoId === mappedTodo.todoId ? mappedTodo : todo
                    ));
                    break;

                case 'TODO_DELETED':
                    setTodos(prev => prev.filter(todo => todo.todoId !== mappedTodo.todoId));
                    break;

                case 'TODO_COMPLETED':
                    setTodos(prev => prev.map(todo =>
                        todo.todoId === mappedTodo.todoId ? mappedTodo : todo
                    ));
                    break;
            }
        });

        // 리액션 이벤트 핸들러
        const removeReactionHandler = addReactionHandler((event) => {
            console.log('리액션 이벤트 수신:', event);

            switch (event.type) {
                case 'REACTION_ADDED':
                    setTodos(prev => prev.map(todo => {
                        if (todo.todoId === event.data.todoId) {
                            return {
                                ...todo,
                                reactions: [...(todo.reactions || []), event.data.reaction]
                            };
                        }
                        return todo;
                    }));
                    break;

                case 'REACTION_DELETED':
                    setTodos(prev => prev.map(todo => {
                        if (todo.todoId === event.data.todoId) {
                            return {
                                ...todo,
                                reactions: (todo.reactions || []).filter(
                                    r => r.reactionId !== event.data.reactionId
                                )
                            };
                        }
                        return todo;
                    }));
                    break;
            }
        });

        // 투표 이벤트 핸들러
        const removeVoteHandler = addVoteHandler((event) => {
            console.log('투표 이벤트 수신:', event);

            switch (event.type) {
                case 'VOTE_UPDATED':
                    // 투표 현황 UI 업데이트 (필요시 별도 상태로 관리)
                    console.log('투표 현황:', event.data);
                    break;

                case 'ROOM_EXTENDED':
                    if (currentStudyRoom) {
                        setCurrentStudyRoom(prev => ({
                            ...prev,
                            extensionCount: event.data.extendedCount,
                            endTime: event.data.newEndTime
                        }));
                    }
                    break;
            }
        });

        // 스터디룸 이벤트 핸들러
        const removeRoomHandler = addRoomHandler((event) => {
            console.log('스터디룸 이벤트 수신:', event);

            switch (event.type) {
                case 'USER_JOINED':
                    if (currentStudyRoom) {
                        setCurrentStudyRoom(prev => ({
                            ...prev,
                            users: [...(prev.users || []), event.data.user]
                        }));
                    }
                    console.log('사용자 입장:', event.data.user);
                    break;

                case 'USER_LEFT':
                    if (currentStudyRoom) {
                        setCurrentStudyRoom(prev => ({
                            ...prev,
                            users: (prev.users || []).filter(
                                user => user.communityId !== event.data.userId
                            )
                        }));
                    }
                    console.log('사용자 퇴장:', event.data.userId);
                    break;

                case 'ROOM_CLOSED':
                    setCurrentStudyRoom(null);
                    setTodos([]);
                    disconnectWebSocket();
                    alert('스터디룸이 종료되었습니다.');
                    break;
            }
        });

        // 클린업
        return () => {
            removeTodoHandler();
            removeReactionHandler();
            removeVoteHandler();
            removeRoomHandler();
        };
    }, [addTodoHandler, addReactionHandler, addVoteHandler, addRoomHandler,
        currentStudyRoom, disconnectWebSocket]);

    // ========== 스터디룸 API ==========

    /**
     * 스터디룸 생성
     * POST /api/study-rooms
     */
    const createStudyRoom = useCallback(async (studyRoomData) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/study-rooms`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(studyRoomData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const studyRoomId = await response.json();
            console.log('스터디룸 생성 성공:', studyRoomId);
            return studyRoomId;
        } catch (error) {
            return handleApiError(error, '스터디룸 생성');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    /**
     * 스터디룸 전체 목록 조회
     * GET /api/study-rooms?page=0&limit=10
     */
    const fetchStudyRooms = useCallback(async (page = 0, limit = 10) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('스터디룸 목록 조회 성공:', data);

            setStudyRooms(data.studyRooms || []);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalElement: data.totalElement
            });

            return data;
        } catch (error) {
            return handleApiError(error, '스터디룸 목록 조회');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, handleApiError]);

    /**
     * 스터디룸 상세 정보 조회
     * GET /api/study-rooms/{studyRoomId}
     */
    const fetchStudyRoomDetail = useCallback(async (studyRoomId) => {
        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('스터디룸 상세 조회 성공:', data);

            setCurrentStudyRoom(data);
            return data;
        } catch (error) {
            return handleApiError(error, '스터디룸 상세 조회');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, handleApiError]);

    /**
     * 스터디룸 참여
     * POST /api/study-rooms/{studyRoomId}/join
     * 참여 성공 시 WebSocket 연결
     */
    const joinStudyRoom = useCallback(async (studyRoomId) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return false;
        }

        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/join`,
                {
                    method: 'POST',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const success = await response.json();
            console.log('스터디룸 참여 성공:', success);

            if (success) {
                // 상세 정보 조회
                await fetchStudyRoomDetail(studyRoomId);
                // To-do 목록 조회
                await fetchTodos(studyRoomId);
                // WebSocket 연결
                connectWebSocket(studyRoomId);
            }

            return success;
        } catch (error) {
            handleApiError(error, '스터디룸 참여');
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError, fetchStudyRoomDetail, connectWebSocket]);

    /**
     * 스터디룸 퇴장
     * POST /api/study-rooms/{studyRoomId}/leave
     * 퇴장 시 WebSocket 연결 해제
     */
    const leaveStudyRoom = useCallback(async (studyRoomId) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return false;
        }

        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/leave`,
                {
                    method: 'POST',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const success = await response.json();
            console.log('스터디룸 퇴장 성공:', success);

            if (success) {
                // WebSocket 연결 해제
                disconnectWebSocket();
                // 상태 초기화
                setCurrentStudyRoom(null);
                setTodos([]);
            }

            return success;
        } catch (error) {
            handleApiError(error, '스터디룸 퇴장');
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError, disconnectWebSocket]);

    // ========== To-do API ==========

    /**
     * To-do 목록 조회
     * GET /api/study-rooms/{studyRoomId}/todos
     */
    const fetchTodos = useCallback(async (studyRoomId) => {
        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Todo 목록 조회 성공:', data);
            const mappedTodos = (data.todos || []).map(todo => ({
                ...todo,
                content: todo.title,
                userId: todo.creatorId
            }));

            setTodos(mappedTodos);

            return data.todos;
        } catch (error) {
            return handleApiError(error, 'Todo 목록 조회');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, handleApiError]);

    /**
     * To-do 작성
     * POST /api/study-rooms/{studyRoomId}/todos
     * WebSocket으로 실시간 공유 (백엔드에서 자동 브로드캐스트)
     */
    const createTodo = useCallback(async (studyRoomId, todoData) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return null;
        }

        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        title: todoData.content, // 컴포넌트에서 content로 넘겨준 값을 title로 매핑
                        description: '' // DTO 매핑용으로 추가 (임시)
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newTodo = await response.json();
            console.log('Todo 작성 성공:', newTodo);

            // 백엔드에서 WebSocket으로 브로드캐스트하므로
            // 여기서는 로컬 상태 업데이트만 수행 (WebSocket 핸들러가 처리)

            return newTodo;
        } catch (error) {
            return handleApiError(error, 'Todo 작성');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    /**
     * To-do 수정
     * PUT /api/study-rooms/{studyRoomId}/todos/{todoId}
     * WebSocket으로 실시간 공유 (백엔드에서 자동 브로드캐스트)
     */
    const updateTodo = useCallback(async (studyRoomId, todoId, todoData) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return null;
        }

        if (!studyRoomId || !todoId) {
            setError('유효하지 않은 ID입니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos/${todoId}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(todoData)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedTodo = await response.json();
            console.log('Todo 수정 성공:', updatedTodo);

            return updatedTodo;
        } catch (error) {
            return handleApiError(error, 'Todo 수정');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    /**
     * To-do 삭제
     * DELETE /api/study-rooms/{studyRoomId}/todos/{todoId}
     * WebSocket으로 실시간 공유 (백엔드에서 자동 브로드캐스트)
     */
    const deleteTodo = useCallback(async (studyRoomId, todoId) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return false;
        }

        if (!studyRoomId || !todoId) {
            setError('유효하지 않은 ID입니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos/${todoId}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Todo 삭제 성공:', todoId);

            return true;
        } catch (error) {
            handleApiError(error, 'Todo 삭제');
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    /**
     * To-do 완료
     * PATCH /api/study-rooms/{studyRoomId}/todos/{todoId}/complete
     * WebSocket으로 실시간 공유 (백엔드에서 자동 브로드캐스트)
     */
    const completeTodo = useCallback(async (studyRoomId, todoId) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return null;
        }

        if (!studyRoomId || !todoId) {
            setError('유효하지 않은 ID입니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos/${todoId}/complete`,
                {
                    method: 'PATCH',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const completedTodo = await response.json();
            console.log('Todo 완료 처리 성공:', completedTodo);

            return completedTodo;
        } catch (error) {
            return handleApiError(error, 'Todo 완료 처리');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    /**
     * To-do 리액션 추가
     * POST /api/study-rooms/{studyRoomId}/todos/{todoId}/reactions
     * WebSocket으로 실시간 공유 (백엔드에서 자동 브로드캐스트)
     */
    const addTodoReaction = useCallback(async (studyRoomId, todoId, emoji) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return null;
        }

        if (!studyRoomId || !todoId) {
            setError('유효하지 않은 ID입니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos/${todoId}/reactions`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ emoji })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reactionId = await response.json();
            console.log('리액션 추가 성공:', reactionId);

            return reactionId;
        } catch (error) {
            return handleApiError(error, '리액션 추가');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    /**
     * To-do 리액션 삭제
     * DELETE /api/study-rooms/{studyRoomId}/todos/{todoId}/reactions/{reactionId}
     * WebSocket으로 실시간 공유 (백엔드에서 자동 브로드캐스트)
     */
    const deleteTodoReaction = useCallback(async (studyRoomId, todoId, reactionId) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return false;
        }

        if (!studyRoomId || !todoId || !reactionId) {
            setError('유효하지 않은 ID입니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos/${todoId}/reactions/${reactionId}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('리액션 삭제 성공:', reactionId);

            return true;
        } catch (error) {
            handleApiError(error, '리액션 삭제');
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    // ========== 연장 관리 API ==========

    /**
     * 연장 투표
     * POST /api/study-rooms/{studyRoomId}/extension-vote
     * WebSocket으로 실시간 투표 현황 공유
     */
    const voteExtension = useCallback(async (studyRoomId, vote) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return null;
        }

        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return null;
        }

        if (vote !== 'agree' && vote !== 'disagree') {
            setError('유효하지 않은 투표입니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/extension-vote`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ vote })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const voteResult = await response.json();
            console.log('연장 투표 성공:', voteResult);

            return voteResult;
        } catch (error) {
            return handleApiError(error, '연장 투표');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    /**
     * 스터디룸 연장
     * POST /api/study-rooms/{studyRoomId}/extend
     * WebSocket으로 연장 완료 알림
     */
    const extendStudyRoom = useCallback(async (studyRoomId) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return null;
        }

        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/extend`,
                {
                    method: 'POST',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const extensionResult = await response.json();
            console.log('스터디룸 연장 성공:', extensionResult);

            return extensionResult;
        } catch (error) {
            return handleApiError(error, '스터디룸 연장');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

    /**
     * 스터디룸 자동 종료
     * POST /api/study-rooms/{studyRoomId}/close
     * 스케줄러로 백엔드에서 처리, WebSocket으로 종료 알림 수신
     */
    const closeStudyRoom = useCallback(async (studyRoomId) => {
        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/close`,
                {
                    method: 'POST',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('스터디룸 종료 성공:', studyRoomId);

            disconnectWebSocket();
            setCurrentStudyRoom(null);
            setTodos([]);

            return true;
        } catch (error) {
            handleApiError(error, '스터디룸 종료');
            return false;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, handleApiError, disconnectWebSocket]);

    // ========== 상태 초기화 ==========

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const resetState = useCallback(() => {
        setStudyRooms([]);
        setCurrentStudyRoom(null);
        setTodos([]);
        setError(null);
        setPagination({
            currentPage: 0,
            totalPages: 0,
            totalElement: 0
        });
        disconnectWebSocket();
    }, [disconnectWebSocket]);

    // ========== 반환 값 ==========

    return {
        // 상태
        studyRooms,
        currentStudyRoom,
        todos,
        loading,
        error,
        pagination,
        connectionStatus, // WebSocket 연결 상태 추가

        // 스터디룸 API
        createStudyRoom,
        fetchStudyRooms,
        fetchStudyRoomDetail,
        joinStudyRoom,
        leaveStudyRoom,

        // To-do API
        fetchTodos,
        createTodo,
        updateTodo,
        deleteTodo,
        completeTodo,
        addTodoReaction,
        deleteTodoReaction,

        // 연장 관리 API
        voteExtension,
        extendStudyRoom,
        closeStudyRoom,

        // 유틸리티
        clearError,
        resetState
    };
};