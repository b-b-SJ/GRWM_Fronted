// src/hooks/useDiaryApi.jsx
import { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

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

            // API_BASE_URL 적용
            const url = `${API_BASE_URL}/api/users/${user.userId}/diaries/default?${queryParams.toString()}`;
            console.log('API_LOG: [GET] 전체 일기 목록 조회 요청 URL:', url);

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
            // API_BASE_URL 적용
            const response = await fetch(
                `${API_BASE_URL}/api/users/${user.userId}/diaries/${diaryId}`,
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
            // API_BASE_URL 적용
            const url = `${API_BASE_URL}/api/users/${user.userId}/diaries`;
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
            // API_BASE_URL 적용
            const response = await fetch(
                `${API_BASE_URL}/api/users/${user.userId}/diaries/${diaryId}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        category: category || '',
                        title,
                        content,
                        tags: tags || [],
                        emotion: emotion === 'Default' ? 'Default' : (emotion || 'default').toLowerCase()
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
            // API_BASE_URL 적용
            const response = await fetch(
                `${API_BASE_URL}/api/users/${user.userId}/diaries/${diaryId}`,
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
        getDiaryDetail,
        createDiary,
        updateDiary,
        deleteDiary,
        getAllDiaries,
        clearError
    };
};