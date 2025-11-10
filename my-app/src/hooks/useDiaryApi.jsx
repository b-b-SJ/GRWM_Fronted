// src/hooks/useDiaryApi.jsx
import { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const useDiaryApi = () => {
    const { getAuthHeaders, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // userId가 작성한 모든 일기 목록 조회
    const getAllDiaries = useCallback(async (page = 0, limit = 10) => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', page);
            queryParams.append('limit', limit);

            const url = `/api/users/${user.userId}/diaries/default?${queryParams.toString()}`;
            console.log('API_LOG: [GET] 전체 일기 목록 (default) 조회 요청 URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API_LOG: [GET] 전체 일기 목록 조회 성공. 총 개수:', data.totalCount);
                return {
                    success: true,
                    data: {
                        diaries: data.diaries || [],
                        totalCount: data.totalCount || 0,
                        currentPage: data.currentPage || 0,
                        totalPages: data.totalPages || 0
                    }
                };
            } else {
                let errorMessage = '전체 일기 목록을 불러오는데 실패했습니다.';
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('전체 일기 목록 조회 오류:', error);
            const errorMsg = '전체 일기 목록을 불러오는 중 오류가 발생했습니다.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    // 일기 목록 조회 (필터, 검색)
    const getDiaryList = useCallback(async (filters = {}) => {
        const { date, category, emotion, keyword, page = 0, limit = 10 } = filters;

        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const queryParams = new URLSearchParams();

            if (date) {
                queryParams.append('date', date);
            }

            queryParams.append('category', category || '');
            queryParams.append('keyword', keyword || '');

            if (emotion && emotion !== 'all') {
                let emotionValue;
                if (emotion.toLowerCase() === 'default') {
                    emotionValue = 'Default';
                } else {
                    emotionValue = emotion.toLowerCase();
                }
                queryParams.append('emotion', emotionValue);
            }

            // 2. 페이징 파라미터는 항상 추가
            queryParams.append('page', page);
            queryParams.append('limit', limit);

            // 로그 추가: 요청 URL 및 파라미터 확인
            const url = `/api/users/${user.userId}/diaries?${queryParams.toString()}`

            const response = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: {
                        diaries: data.diaries || [],
                        totalCount: data.totalCount || 0,
                        currentPage: data.currentPage || 0,
                        totalPages: data.totalPages || 0
                    }
                };
            } else {
                let errorMessage = '일기 목록을 불러오는데 실패했습니다.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('일기 목록 조회 실패 (JSON):', errorData);
                } catch (e) {
                    console.error('일기 목록 조회 실패 (상태 코드):', response.status);
                    if (response.status === 403) {
                        errorMessage = '접근 권한이 없습니다. 다시 로그인해주세요.';
                    } else if (response.status === 400) {
                        errorMessage = '잘못된 요청입니다.';
                    } else if (response.status === 500) {
                        errorMessage = '서버 오류가 발생했습니다.';
                    }
                }
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('일기 목록 조회 오류:', error);
            const errorMsg = '일기 목록을 불러오는 중 오류가 발생했습니다.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    // 일기 상세 조회
    const getDiaryDetail = useCallback(async (diaryId) => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        if (!diaryId) {
            setError('일기 ID가 필요합니다.');
            return { success: false, error: '일기 ID가 필요합니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/users/${user.userId}/diaries/${diaryId}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                let errorMessage = '일기를 불러오는데 실패했습니다.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    if (response.status === 404) {
                        errorMessage = '요청한 일기를 찾을 수 없습니다.';
                    }
                }
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('일기 상세 조회 오류:', error);
            const errorMsg = '일기를 불러오는 중 오류가 발생했습니다.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    // 일기 작성
    const createDiary = useCallback(async (diaryData) => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        const { title, content, category, emotion, tags, date } = diaryData;

        if (!title || !content) {
            setError('제목과 내용은 필수입니다.');
            return { success: false, error: '제목과 내용은 필수입니다.' };
        }

        setIsLoading(true);
        setError('');

        const requestBody = {
            title,
            content,
            category: category || '',

            emotion: emotion === 'default' ? 'Default' : (emotion || 'Default'),
            tags: tags || [],
            date: date || new Date().toISOString().split('T')[0]
        };

        try {
            const url = `/api/users/${user.userId}/diaries`;
            const response = await fetch(
                url,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(requestBody)
                }
            );

            // 로그 추가: 응답 상태 확인
            console.log('API_LOG: [POST] 일기 작성 응답 상태:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('API_LOG: [POST] 일기 작성 성공. 반환된 일기 ID:', data.id);
                return { success: true, data };
            } else {
                let errorMessage = '일기 작성에 실패했습니다.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('API_LOG: [POST] 일기 작성 실패 상세:', errorData);
                } catch (e) {
                    // JSON 응답이 없는 경우 처리
                    if (response.status === 400) {
                        errorMessage = '요청 데이터가 올바르지 않습니다.';
                    }
                }
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('일기 작성 오류:', error);
            setError('일기 작성 중 오류가 발생했습니다.');
            return { success: false, error: '일기 작성 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    // 일기 수정
    const updateDiary = useCallback(async (diaryId, diaryData) => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        if (!diaryId) {
            setError('일기 ID가 필요합니다.');
            return { success: false, error: '일기 ID가 필요합니다.' };
        }

        const { title, content, category, emotion, tags } = diaryData;

        if (!title || !content) {
            setError('제목과 내용은 필수입니다.');
            return { success: false, error: '제목과 내용은 필수입니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/users/${user.userId}/diaries/${diaryId}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        category: category || '',
                        title,
                        content,
                        tags: tags || [],
                        emotion: (emotion || 'Default').toLowerCase()
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                let errorMessage = '일기 수정에 실패했습니다.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // JSON 응답이 없는 경우 처리
                    if (response.status === 400) {
                        errorMessage = '요청 데이터가 올바르지 않습니다.';
                    }
                }
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('일기 수정 오류:', error);
            setError('일기 수정 중 오류가 발생했습니다.');
            return { success: false, error: '일기 수정 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    // 일기 삭제
    const deleteDiary = useCallback(async (diaryId) => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        if (!diaryId) {
            setError('일기 ID가 필요합니다.');
            return { success: false, error: '일기 ID가 필요합니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/users/${user.userId}/diaries/${diaryId}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );

            if (response.ok || response.status === 204) {
                return { success: true };
            } else {
                let errorMessage = '일기 삭제에 실패했습니다.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    if (response.status === 404) {
                        errorMessage = '요청한 일기를 찾을 수 없습니다.';
                    }
                }
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('일기 삭제 오류:', error);
            setError('일기 삭제 중 오류가 발생했습니다.');
            return { success: false, error: '일기 삭제 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    const clearError = () => setError('');

    return {
        isLoading,
        error,
        getDiaryList,
        getDiaryDetail,
        createDiary,
        updateDiary,
        deleteDiary,
        getAllDiaries,
        clearError
    };
};