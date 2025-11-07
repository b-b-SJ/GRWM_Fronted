import {useCallback, useState} from 'react';

/**
 * To-Do API 연동을 위한 커스텀 훅
 */
export const useTodoApi = (user, isAuthenticated, getAuthHeaders) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentUser = user || {
        userId: null,
        username: '게스트',
        loginId: null,
    };

    // 인증 체크
    const checkAuth = () => {
        if (!isAuthenticated || !user) {
            throw new Error('로그인이 필요합니다.');
        }
    };

    // 에러 핸들링 헬퍼
    const handleError = (error, customMessage) => {
        console.error(customMessage, error);
        const errorMessage = error.response?.data?.message || error.message || customMessage;
        setError(errorMessage);
        throw new Error(errorMessage);
    };

    // ==================== 개인 To-Do CRUD ====================

    /**
     * 1.1 To-Do 목록 조회
     */
    const getTodos = useCallback(async (userId, params = {}) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();

            if (params.date) queryParams.append('date', params.date);
            queryParams.append('status', params.status || 'uncompleted');  // 기본값 제공
            queryParams.append('page', params.page !== undefined ? params.page : 0);  // 기본값 0
            queryParams.append('limit', params.limit !== undefined ? params.limit : 100);  // 기본값 100

            const queryString = queryParams.toString();
            const url = `/api/users/${userId}/todos?${queryString}`;  // ? 항상 포함

            const response = await fetch(url, {  // url 변수 사용
                method: 'GET',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            handleError(err, 'To-Do 목록 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    /**
     * 1.2 개인 To-Do 작성
     */
    const createTodo = useCallback(async (userId, todoData) => {
            checkAuth();
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/users/${userId}/todos`, {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(todoData),
                });

                return await response.json();
            } catch (err) {
                handleError(err, 'To-Do 작성 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        }, [isAuthenticated, user, getAuthHeaders]);

    /**
     * 1.3 개인 To-Do 수정
     */
    const updateTodo = useCallback(async (userId, todoId, todoData) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${userId}/todos/${todoId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(todoData),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            handleError(err, 'To-Do 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    /**
     * 1.4 개인 To-Do 삭제
     */
    const deleteTodo = useCallback(async (userId, todoId) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${userId}/todos/${todoId}`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return { success: true };
        } catch (err) {
            handleError(err, 'To-Do 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    /**
     * 개인 To-Do 완료 처리
     */
    const completeTodo = useCallback(async (userId, todoId) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${userId}/todos/${todoId}/complete`, {
                method: 'PATCH',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            handleError(err, 'To-Do 완료 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    // ==================== 반복 To-Do 관리 ====================

    /**
     * 2.1 반복 To-Do 목록 조회
     * @param userId, params(type, status)
     * @returns {Promise<{recurringTodos: Array, activeCount: number, totalCount: number}>}
     */
    const getRecurringTodos = useCallback(async (userId, params = {}) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (params.type) queryParams.append('type', params.type);
            if (params.status) queryParams.append('status', params.status);

            const response = await fetch(`/api/users/${userId}/recurring-todos?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            handleError(err, '반복 To-Do 목록 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    /**
     * 2.2 반복 To-Do 생성
     * @param userId, recurringTodoData(title, description, recurrenceType, recurrenceConfig, startDate)
     * @returns {Promise<{recurringTodo: Object}>}
     */
    const createRecurringTodo = useCallback(async (userId, recurringTodoData) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${userId}/recurring-todos`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recurringTodoData),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            handleError(err, '반복 To-Do 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    /**
     * 2.3 반복 To-Do 수정
     * @param userId, recurringId, recurringTodoData
     * @returns {Promise<Object>}
     */
    const updateRecurringTodo = useCallback(async (userId, recurringId, recurringTodoData) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${userId}/recurring-todos/${recurringId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recurringTodoData),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            handleError(err, '반복 To-Do 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    /**
     * 2.4 반복 To-Do 삭제
     * @param userId, recurringId
     * @returns {Promise<{success: boolean}>}
     */
    const deleteRecurringTodo = useCallback(async (userId, recurringId) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${userId}/recurring-todos/${recurringId}`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return { success: true };
        } catch (err) {
            handleError(err, '반복 To-Do 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    /**
     * 2.5 반복 To-Do 자동 생성 : 임시
     * @param {number} userId - 사용자 ID
     * @param {Object} params - 생성 파라미터
     * @param {Date} params.targetDate - 생성 대상 날짜 (기본값: 오늘)
     * @returns {Promise<{generatedTodos: Array, targetDate: Date}>}
     */
    const generateRecurringTodos = useCallback(async (userId, params = {}) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${userId}/recurring-todos/generate`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            handleError(err, '반복 To-Do 자동 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, getAuthHeaders]);

    return {
        loading,
        error,
        currentUser,
        // 개인 To-Do
        getTodos,
        createTodo,
        updateTodo,
        deleteTodo,
        completeTodo,
        // 반복 To-Do
        getRecurringTodos,
        createRecurringTodo,
        updateRecurringTodo,
        deleteRecurringTodo,
        generateRecurringTodos,
    };
};

export default useTodoApi;