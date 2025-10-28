import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * useStudyRoomState 커스텀 훅
 * - 스터디룸 관련 상태 관리 및 API 통신
 * - REST API: 스터디룸 생성, 조회, 참여, 퇴장 / To-do CRUD 및 완료 처리
 * - WebSocket 필요 기능 (🔴로 표시) :
 *   1. To-do 실시간 공유 (생성/수정/삭제/완료)
 *   2. To-do 리액션 실시간 업데이트
 *   3. 연장 투표 실시간 동기화
 *   4. 참여자 입장/퇴장 실시간 알림
 *   5. 스터디룸 자동 종료 알림
 */


export const useStudyRoomState = () => {
    const { isAuthenticated } = useAuth();

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
        totalElements: 0
    });

    // WebSocket 관련 (추후 WebSocket 통합 시 사용)
    const wsHandlersRef = useRef([]);

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
            // 서버 응답이 있는 경우
            errorMessage = error.response.data?.message || `서버 오류 (${error.response.status})`;
        } else if (error.request) {
            // 요청은 전송되었으나 응답이 없는 경우
            errorMessage = '서버 응답이 없습니다. 네트워크를 확인해주세요.';
        } else {
            // 요청 설정 중 오류 발생
            errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
        }

        setError(errorMessage);
        return null;
    }, []);

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
                totalElements: data.totalElement
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

            // 참여 성공 시 상세 정보 다시 조회
            if (success) {
                await fetchStudyRoomDetail(studyRoomId);
            }

            return success;
        } catch (error) {
            handleApiError(error, '스터디룸 참여');
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError, fetchStudyRoomDetail]);

    /**
     * 스터디룸 퇴장
     * POST /api/study-rooms/{studyRoomId}/leave
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

            // 퇴장 성공 시 현재 스터디룸 상태 초기화
            if (success) {
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
    }, [isAuthenticated, getAuthHeaders, handleApiError]);

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

            setTodos(data.todos || []);
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
     * 🔴 WebSocket으로 실시간 공유 필요
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
                    body: JSON.stringify(todoData)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newTodo = await response.json();
            console.log('Todo 작성 성공:', newTodo);

            // 로컬 상태 업데이트
            setTodos(prev => [...prev, newTodo]);

            // TODO: WebSocket으로 다른 참여자에게 브로드캐스트
            // notifyTodoCreated(studyRoomId, newTodo);

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
     * 🔴 WebSocket으로 실시간 공유 필요
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

            // 로컬 상태 업데이트
            setTodos(prev => prev.map(todo =>
                todo.todoId === todoId ? updatedTodo : todo
            ));

            // TODO: WebSocket으로 다른 참여자에게 브로드캐스트
            // notifyTodoUpdated(studyRoomId, updatedTodo);

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
     * 🔴 WebSocket으로 실시간 공유 필요
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

            // 로컬 상태 업데이트
            setTodos(prev => prev.filter(todo => todo.todoId !== todoId));

            // TODO: WebSocket으로 다른 참여자에게 브로드캐스트
            // notifyTodoDeleted(studyRoomId, todoId);

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
     * Response: 완료된 Todo 객체 반환
     * 🔴 WebSocket으로 실시간 공유 필요
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

            // 로컬 상태 업데이트 (서버에서 받은 완료된 Todo로 교체)
            setTodos(prev => prev.map(todo =>
                todo.todoId === todoId ? completedTodo : todo
            ));

            // TODO: WebSocket으로 다른 참여자에게 브로드캐스트
            // notifyTodoCompleted(studyRoomId, completedTodo);

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
     * 🔴 WebSocket으로 실시간 공유 필요
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

            // 로컬 상태 업데이트
            setTodos(prev => prev.map(todo => {
                if (todo.todoId === todoId) {
                    return {
                        ...todo,
                        reactions: [...(todo.reactions || []), emoji]
                    };
                }
                return todo;
            }));

            // TODO: WebSocket으로 다른 참여자에게 브로드캐스트
            // notifyReactionAdded(studyRoomId, todoId, emoji);

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
     * 🔴 WebSocket으로 실시간 공유 필요
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

            // TODO: 로컬 상태 업데이트 (reactionId를 이용한 삭제 필요)
            // setTodos(prev => prev.map(todo => {
            //     if (todo.todoId === todoId) {
            //         return {
            //             ...todo,
            //             reactions: todo.reactions.filter(r => r.id !== reactionId)
            //         };
            //     }
            //     return todo;
            // }));

            // TODO: WebSocket으로 다른 참여자에게 브로드캐스트
            // notifyReactionDeleted(studyRoomId, todoId, reactionId);

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
     * 🔴 WebSocket으로 실시간 투표 현황 공유 필요
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

            // TODO: WebSocket으로 다른 참여자에게 투표 현황 브로드캐스트
            // notifyVoteUpdate(studyRoomId, voteResult);

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
     * 🔴 WebSocket으로 연장 완료 알림 필요
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

            // 현재 스터디룸 정보 업데이트
            if (currentStudyRoom) {
                setCurrentStudyRoom(prev => ({
                    ...prev,
                    extensionCount: extensionResult.extendedCount
                }));
            }

            // TODO: WebSocket으로 다른 참여자에게 연장 완료 브로드캐스트
            // notifyRoomExtended(studyRoomId, extensionResult);

            return extensionResult;
        } catch (error) {
            return handleApiError(error, '스터디룸 연장');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, handleApiError, currentStudyRoom]);

    /**
     * 스터디룸 자동 종료
     * POST /api/study-rooms/{studyRoomId}/close
     * 🔴 스케줄러로 백엔드에서 처리, WebSocket으로 종료 알림 수신
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

            // 현재 스터디룸 상태 초기화
            setCurrentStudyRoom(null);
            setTodos([]);

            // TODO: WebSocket으로 다른 참여자에게 종료 알림 브로드캐스트
            // notifyRoomClosed(studyRoomId);

            return true;
        } catch (error) {
            handleApiError(error, '스터디룸 종료');
            return false;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, handleApiError]);

    // ========== WebSocket 연동 (추후 구현) ==========

    /**
     * WebSocket 이벤트 핸들러 등록
     * 기존 WebSocketContext의 패턴을 따라 구현 예정
     */
    const addStudyRoomEventHandler = useCallback((handler) => {
        wsHandlersRef.current.push(handler);

        return () => {
            wsHandlersRef.current = wsHandlersRef.current.filter(h => h !== handler);
        };
    }, []);

    /**
     * WebSocket 이벤트 처리
     * 예상 이벤트 타입:
     * - TODO_CREATED: To-do 생성
     * - TODO_UPDATED: To-do 수정
     * - TODO_DELETED: To-do 삭제
     * - TODO_COMPLETED: To-do 완료
     * - REACTION_ADDED: 리액션 추가
     * - REACTION_DELETED: 리액션 삭제
     * - VOTE_UPDATED: 투표 현황 업데이트
     * - ROOM_EXTENDED: 스터디룸 연장
     * - ROOM_CLOSED: 스터디룸 종료
     * - USER_JOINED: 사용자 입장
     * - USER_LEFT: 사용자 퇴장
     */
    const handleStudyRoomEvent = useCallback((event) => {
        console.log('스터디룸 WebSocket 이벤트 수신:', event);

        switch (event.type) {
            case 'TODO_CREATED':
                setTodos(prev => [...prev, event.data]);
                break;

            case 'TODO_UPDATED':
                setTodos(prev => prev.map(todo =>
                    todo.todoId === event.data.todoId ? event.data : todo
                ));
                break;

            case 'TODO_DELETED':
                setTodos(prev => prev.filter(todo => todo.todoId !== event.data.todoId));
                break;

            case 'TODO_COMPLETED':
                setTodos(prev => prev.map(todo =>
                    todo.todoId === event.data.todoId
                        ? { ...todo, isCompleted: true }
                        : todo
                ));
                break;

            case 'REACTION_ADDED':
                setTodos(prev => prev.map(todo => {
                    if (todo.todoId === event.data.todoId) {
                        return {
                            ...todo,
                            reactions: [...(todo.reactions || []), event.data.emoji]
                        };
                    }
                    return todo;
                }));
                break;

            case 'REACTION_DELETED':
                // reactionId 기반 삭제 로직 구현 필요
                break;

            case 'VOTE_UPDATED':
                // 투표 현황 UI 업데이트
                console.log('투표 현황 업데이트:', event.data);
                break;

            case 'ROOM_EXTENDED':
                if (currentStudyRoom) {
                    setCurrentStudyRoom(prev => ({
                        ...prev,
                        extensionCount: event.data.extendedCount
                    }));
                }
                break;

            case 'ROOM_CLOSED':
                setCurrentStudyRoom(null);
                setTodos([]);
                console.log('스터디룸이 종료되었습니다.');
                break;

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

            default:
                console.warn('알 수 없는 이벤트 타입:', event.type);
        }

        // 등록된 핸들러들에게 이벤트 전달
        wsHandlersRef.current.forEach(handler => {
            try {
                handler(event);
            } catch (error) {
                console.error('WebSocket 핸들러 오류:', error);
            }
        });
    }, [currentStudyRoom]);

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
            totalElements: 0
        });
    }, []);

    // ========== 반환 값 ==========

    return {
        // 상태
        studyRooms,
        currentStudyRoom,
        todos,
        loading,
        error,
        pagination,

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

        // WebSocket 관련 (추후 구현)
        addStudyRoomEventHandler,
        handleStudyRoomEvent,

        // 유틸리티
        clearError,
        resetState
    };
};