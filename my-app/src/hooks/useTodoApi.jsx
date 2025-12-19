import {useCallback, useState} from 'react';

/**
 * To-Do API 연동을 위한 커스텀 훅
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const useTodoApi = (user, isAuthenticated, getAuthHeaders) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentUser = user || {
        userId: null,
        username: '게스트',
        loginId: null,
    };

    const checkAuth = useCallback(() => {
        if (!isAuthenticated || !user) {
            throw new Error('로그인이 필요합니다.');
        }
    }, [isAuthenticated, user]);

    // 에러 핸들링 헬퍼
    const handleError = (error, customMessage) => {
        console.error(customMessage, error);
        const errorMessage = error.response?.data?.message || error.message || customMessage;
        setError(errorMessage);
        throw new Error(errorMessage);
    };

    // 로컬 날짜를 'YYYY-MM-DD' 형식으로 안전하게 변환하는 함수
    const formatLocalIdDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
            const url = `${API_BASE_URL}/api/users/${userId}/todos?${queryString}`;

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
    }, [getAuthHeaders, checkAuth]);

    /**
     * 1.2 개인 To-Do 작성
     */
    const createTodo = useCallback(async (userId, todoData) => {
        checkAuth();
        setLoading(true);
        setError(null);

        const processedData = {
            ...todoData,
            // 만약 todoData.date가 Date 객체라면 문자열로 변환
            date: todoData.date instanceof Date ? formatLocalIdDate(todoData.date) : todoData.date
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/todos`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(processedData),
            });
            console.log(processedData);

            return await response.json();
        } catch (err) {
            handleError(err, 'To-Do 작성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, checkAuth]);

    /**
     * 1.3 개인 To-Do 수정
     */
    const updateTodo = useCallback(async (userId, todoId, todoData) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/todos/${todoId}`, {
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
    }, [getAuthHeaders, checkAuth]);

    /**
     * 1.4 개인 To-Do 삭제
     */
    const deleteTodo = useCallback(async (userId, todoId) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/todos/${todoId}`, {
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
    }, [getAuthHeaders, checkAuth]);

    /**
     * 개인 To-Do 완료 처리
     */
    const completeTodo = useCallback(async (userId, todoId) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/todos/${todoId}/complete`, {
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
    }, [getAuthHeaders, checkAuth]);

    // ==================== 반복 To-Do 관리 ====================

    /**
     * 2.1 반복 To-Do 목록 조회
     */
    const getRecurringTodos = useCallback(async (userId, params = {}) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();

            if (params.status) queryParams.append('status', params.status);
            const queryString = queryParams.toString();

            const url = `${API_BASE_URL}/api/users/${userId}/recurring-todos?${queryString}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            // 백엔드는 RecurringTodoListDto 형태로 반환하므로, 리스트만 추출하여 반환
            const data = await response.json();
            return data.recurringTodos; // DTO 구조에 맞춰 리스트만 반환하도록 수정

        } catch (err) {
            handleError(err, '반복 To-Do 목록 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, checkAuth]);

    /**
     * 2.2 반복 To-Do 생성
     */
    const createRecurringTodo = useCallback(async (userId, recurringTodoData) => {
        checkAuth();
        setLoading(true);
        setError(null);

        const { recurrenceType, recurrenceConfig, startDate, ...rest } = recurringTodoData;

        const processedStartDate =
            startDate instanceof Date
                ? formatLocalIdDate(startDate)
                : startDate;

        let processedRecurrenceConfig = {
            interval: 0,
            weekly: [],
            monthly: 0,
        };

        if (recurrenceConfig) {
            if (recurrenceType === 'daily' && recurrenceConfig.daily) {
                // 'daily' 타입의 경우 'interval' 필드에 'repeatInterval' 값
                processedRecurrenceConfig.interval = recurrenceConfig.daily.repeatInterval || 1;
            } else if (recurrenceType === 'weekly' && recurrenceConfig.weekly) {
                processedRecurrenceConfig.weekly = recurrenceConfig.weekly.daysOfWeek || [];
            } else if (recurrenceType === 'monthly' && recurrenceConfig.monthly) {
                processedRecurrenceConfig.monthly = recurrenceConfig.monthly.dayOfMonth || 0;
            }
        }

        const dataToSend = {
            ...rest,
            recurrenceType,
            startDate: processedStartDate,
            recurrenceConfig: processedRecurrenceConfig,
            recurring : true,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/recurring-todos`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Create API Error:', response.status, errorData);
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Create API Success:', data);
            return data;
        } catch (err) {
            handleError(err, '반복 To-Do 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, checkAuth]);

    /**
     * 2.3 반복 To-Do 수정
     */
    const updateRecurringTodo = useCallback(async (userId, recurringId, recurringTodoData) => {
        checkAuth();
        setLoading(true);
        setError(null);

        const rawDate = recurringTodoData.startDate || recurringTodoData.date;
        const processedDate = rawDate instanceof Date ? formatLocalIdDate(rawDate) : rawDate;

        const dataToSend = {
            title: recurringTodoData.title,
            description: recurringTodoData.description,
            startDate: processedDate,
            active: recurringTodoData.active,
            repeatRange: recurringTodoData.repeatRange || recurringTodoData.recurrenceType,
            // 개별 필드로 전송
            daily: recurringTodoData.daily || 0,
            weekly: recurringTodoData.weekly || [],
            monthly: recurringTodoData.monthly || 0
        };


        console.log('Update Request Data:', dataToSend); // 디버깅용

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/recurring-todos/${recurringId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Update API Error:', response.status, errorData);
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            handleError(err, '반복 To-Do 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders, checkAuth]);

    /**
     * 2.4 반복 To-Do 삭제
     */
    const deleteRecurringTodo = useCallback(async (userId, recurringId) => {
        checkAuth();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/recurring-todos/${recurringId}`, {
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
    }, [getAuthHeaders, checkAuth]);

    /**
     * 2.5 반복 To-Do 자동 생성
     */
    const generateRecurringTodos = useCallback(async (userId, params = {}) => {
        checkAuth();
        setLoading(true);
        setError(null);

        // targetDate가 Date 객체라면 문자열로 변환
        const processedParams = { ...params };
        if (processedParams.targetDate && processedParams.targetDate instanceof Date) {
            processedParams.targetDate = formatLocalIdDate(processedParams.targetDate);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/recurring-todos/generate`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(processedParams),
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
    }, [getAuthHeaders, checkAuth]);

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