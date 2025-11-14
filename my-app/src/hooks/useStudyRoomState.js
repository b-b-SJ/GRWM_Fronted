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
    const [joinedStudyRoom, setJoinedStudyRoom] = useState(null);
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
        loginId: null,
        communityId : null
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

            switch (event.type) {
                case 'TODO_CREATED':
                    setTodos(prev => {
                        // event.todoId 사용
                        if (prev.some(todo => todo?.todoId === event.todoId)) {
                            return prev;
                        }
                        return [...prev, event];
                    });
                    break;

                case 'TODO_UPDATED':
                    setTodos(prev => prev.map(todo =>
                        todo.todoId === event.todoId ? event : todo
                    ));
                    break;

                case 'TODO_DELETED':
                    setTodos(prev => prev.filter(todo => todo.todoId !== event.todoId));
                    break;

                case 'TODO_COMPLETED':
                    setTodos(prev => prev.map(todo =>
                        todo.todoId === event.todoId ? event : todo
                    ));
                    break;
            }
        });

        // 리액션 이벤트 핸들러
        const removeReactionHandler = addReactionHandler(async(event) => {
            console.log('리액션 이벤트 수신:', event);

            switch (event.type) {
                case 'REACTION_ADDED':
                    setTodos(prev => prev.map(todo => {
                        if (todo.todoId === event.todoId) {
                            return {
                                ...todo,
                                reactions: [
                                    ...(todo.reactions || []),
                                    {
                                        reactionId: event.reactionId,
                                        creatorId: event.creatorId
                                    }
                                ]
                            };
                        }
                        return todo;
                    }));
                    break;

                case 'REACTION_DELETED':
                    setTodos(prev => prev.map(todo => {
                        if (todo.todoId === event.todoId) {
                            return {
                                ...todo,
                                reactions: (todo.reactions || []).filter(
                                    r => r.reactionId !== event.reactionId
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
                    console.log('투표 현황:', event);
                    break;

                case 'ROOM_EXTENDED':
                    if (currentStudyRoom) {
                        setCurrentStudyRoom(prev => ({
                            ...prev,
                            extensionCount: event.extendedCount,
                            endTime: event.extendedEndTime
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
                            users: [...(prev.users || []), event.user],
                            currentMembers: (prev.currentMembers || 0) + 1
                        }));
                    }
                    if (joinedStudyRoom) {
                        setJoinedStudyRoom(prev => ({
                            ...prev,
                            currentMembers: (prev.currentMembers || 0) + 1
                        }));
                    }
                    console.log('사용자 입장:', event.user);
                    break;

                case 'USER_LEFT':
                    if (currentStudyRoom) {
                        setCurrentStudyRoom(prev => ({
                            ...prev,
                            users: (prev.users || []).filter(
                                user => user.communityId !== event.userId
                            ),
                            currentMembers: Math.max((prev.currentMembers || 1) - 1, 0)
                        }));
                    }
                    console.log('사용자 퇴장:', event.userId);
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
        currentStudyRoom, joinedStudyRoom, disconnectWebSocket]);

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

    // ========== fetch API ==========

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
     * 참여중인 스터디룸 조회
     * GET /api/study-rooms/joined
     */
    const fetchJoinedStudyRoom = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/study-rooms/joined`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

            // 500 에러도 처리
            if (!response.ok) {
                const errorText = await response.text();
                console.warn('참여 중인 스터디룸 조회 실패:', response.status, errorText);

                setJoinedStudyRoom(null);
                return null;
            }

            const data = await response.json();
            console.log('참여 중인 스터디룸 조회 성공:', data);

            // 단일 객체 응답 처리
            if (!data || !data.id) {
                console.log('참여 중인 스터디룸이 없습니다.');
                setJoinedStudyRoom(null);
                return null;
            }

            // 스터디룸 매핑
            const mappedRoom = {
                studyRoomId: data.id,
                name: data.name || '이름 없는 스터디룸',
                description: data.description || '',
                category: data.category || '일반',
                isPrivate : data.private ||  data.isPrivate,
                status: 'ACTIVE', // 참여 중이면 활성 상태
                currentMembers: data.currentMembers || 1, // 본인만 표시하거나 백엔드에서 받은 값 사용
                maxMembers: data.maxMember || data.maxMembers || 8,
                endTime: data.endTime,
                startTime: data.startTime,
                creator: data.creator,
                password : data.password,
            };

            console.log('매핑된 참여 중인 스터디룸:', mappedRoom);
            setJoinedStudyRoom(mappedRoom);

            return mappedRoom;
        } catch (error) {
            console.error('참여 중인 스터디룸 조회 오류:', error);
            setJoinedStudyRoom(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

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

            // 백엔드의 중첩된 구조를 평탄화
            const studyRoomData = data.studyRoom || data;

            const mappedRoom = {
                studyRoomId: studyRoomId,
                name: studyRoomData.name,
                description: studyRoomData.description,
                category: studyRoomData.category,
                creator: studyRoomData.creator,
                extensionTime: studyRoomData.extensionTime,
                isPrivate : studyRoomData.private || studyRoomData.isPrivate,
                password : studyRoomData.password,

                roomName: studyRoomData.name,
                endTime: studyRoomData.endTime,
                startTime: studyRoomData.startTime,
                duration: studyRoomData.duration,
                extensionCount: studyRoomData.extensionCount || 0,

                users: studyRoomData.users || [],
                currentMembers: studyRoomData.currentMembers || 0,
                maxMembers: 8,

                todoList: studyRoomData.todoList || [],
                currentUserStatus: studyRoomData.currentUserStatus
            };
            console.log('[useStudyRoomState] mappedRoom:', mappedRoom); // 디버깅용

            //  현재 참여자 목록을 todos 상태에 저장
            if (mappedRoom.todoList.length > 0) {
                const mappedTodos = mappedRoom.todoList.map(todo => ({
                    todoId: todo.todoId,
                    creatorId: todo.creatorId,
                    content: todo.content,
                    completed: todo.completed,
                    reactions: (todo.reactions || []).map((_, index) => ({
                        reactionId: `temp-${todo.todoId}-${index}`,
                        creatorId: null
                    })),
                    type: todo.type
                }));

                console.log('[useStudyRoomState] 매핑된 todoList:', mappedTodos);
            }

            setCurrentStudyRoom(mappedRoom);
            return mappedRoom;
        } catch (error) {
            return handleApiError(error, '스터디룸 상세 조회');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, handleApiError]);

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
            const todosArray = Array.isArray(data) ? data : (data.todos || []);
            const mappedTodos = todosArray.map(todo => ({
                todoId: todo.todoId,
                creatorId: todo.creatorId,
                content: todo.content,
                completed: todo.completed,
                reactions: (todo.reactions || []).map((_, index) => ({
                    reactionId: `temp-${todo.todoId}-${index}`,
                    creatorId: null
                })),
                type: todo.type
            }));

            console.log('매핑된 Todo 목록:', mappedTodos);
            setTodos(mappedTodos);

            return mappedTodos;
        } catch (error) {
            return handleApiError(error, 'Todo 목록 조회');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, handleApiError]);

    /**
     * 스터디룸 참여
     * POST /api/study-rooms/{studyRoomId}/join
     * 참여 성공 시 WebSocket 연결
     */
    const joinStudyRoom = useCallback(async (studyRoomId, isPrivate = false, password = null) => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return false;
        }

        if (!studyRoomId) {
            setError('유효하지 않은 스터디룸 ID입니다.');
            return false;
        }

        // 비공개 스터디룸인데 비밀번호가 없으면 에러
        if (isPrivate && !password) {
            setError('비공개 스터디룸은 비밀번호가 필요합니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('[useStudyRoomState] 스터디룸 참여 시작:', studyRoomId);

            const requestBody = isPrivate ? { password } : {};

            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/join`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const success = await response.json();
            console.log('[useStudyRoomState] 스터디룸 참여 API 응답:', success);

            if (success) {
                // 1. 참여 중인 스터디룸 목록 새로고침
                console.log('[useStudyRoomState] 참여 중인 스터디룸 목록 새로고침');
                const joinedStudyRoom = await fetchJoinedStudyRoom();
                console.log('[useStudyRoomState] 새로고침 후 joinedRooms:', joinedStudyRoom);

                // 2. 전체 스터디룸 목록 새로고침 (탐색 페이지 업데이트용)
                console.log('[useStudyRoomState] 전체 스터디룸 목록 새로고침');
                await fetchStudyRooms(0, 50);

                // 3. 상세 정보 조회
                console.log('[useStudyRoomState] 스터디룸 상세 정보 조회');
                await fetchStudyRoomDetail(studyRoomId);

                // 4. To-do 목록 조회
                console.log('[useStudyRoomState] To-do 목록 조회');
                await fetchTodos(studyRoomId);

                // 5. WebSocket 연결
                console.log('[useStudyRoomState] WebSocket 연결 시작');
                connectWebSocket(studyRoomId);

                console.log('[useStudyRoomState] 스터디룸 참여 완료');
            }

            return success;
        } catch (error) {
            console.error('[useStudyRoomState] 스터디룸 참여 오류:', error);
            handleApiError(error, '스터디룸 참여');
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError, fetchStudyRoomDetail,
        fetchTodos, fetchJoinedStudyRoom, fetchStudyRooms, connectWebSocket]);

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
                setJoinedStudyRoom(null);

                await fetchStudyRooms(0, 10);
            }

            return success;
        } catch (error) {
            handleApiError(error, '스터디룸 퇴장');
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError, disconnectWebSocket, fetchStudyRooms]);

    // ========== To-do API  (fetch 제외) ==========

    /**
     * To-do 작성
     * POST /api/study-rooms/{studyRoomId}/todos
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
            const requestBody = {
                content: todoData.content || todoData.title,
                // 백엔드 DTO에 있는 필드 추가
            };

            console.log('[useStudyRoomState] Todo 작성 요청:', requestBody);

            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newTodo = await response.json();
            console.log('[useStudyRoomState] Todo 작성 성공:', newTodo);

            // WebSocket으로 실시간 동기화되므로 로컬 상태는 업데이트하지 않음
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
            // completed를 포함한 업데이트 요청
            const requestBody = {
                content: todoData.content || todoData.title,
                completed: todoData.completed
            };

            console.log('[useStudyRoomState] Todo 수정 요청:', requestBody);

            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos/${todoId}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedTodo = await response.json();
            console.log('[useStudyRoomState] Todo 수정 성공:', updatedTodo);

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
     * 백엔드: emoji를 받지 않고, reactionId만 반환
     */
    const addTodoReaction = useCallback(async (studyRoomId, todoId) => {
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
            console.log('[useStudyRoomState] 리액션 추가 요청:', { studyRoomId, todoId });

            const response = await fetch(
                `/api/study-rooms/${studyRoomId}/todos/${todoId}/reactions`,
                {
                    method: 'POST',
                    headers: getAuthHeaders()
                    // body 없음 - 백엔드에서 userDetails로부터 사용자 정보 가져옴
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reactionId = await response.json();
            console.log('[useStudyRoomState] 리액션 추가 성공:', reactionId);

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
        joinedStudyRoom,
        connectionStatus, // WebSocket 연결 상태 추가

        // 스터디룸 API
        createStudyRoom,
        fetchStudyRooms,
        fetchJoinedStudyRoom,
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