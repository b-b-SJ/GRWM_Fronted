// src/hooks/useDiaryApi.jsx
import { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const useDiaryApi = () => {
    const { getAuthHeaders, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 일기 목록 조회
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

            queryParams.append('date', date || new Date().toISOString().split('T')[0]);
            queryParams.append('category', category || '');  // 없으면 빈 문자열
            queryParams.append('emotion', emotion || '');    // 없으면 빈 문자열
            queryParams.append('keyword', keyword || '');    // 없으면 빈 문자열
            queryParams.append('page', page);
            queryParams.append('limit', limit);

            const response = await fetch(
                `/api/users/${user.userId}/diaries?${queryParams.toString()}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

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
                // 핵심 수정: JSON 파싱 실패 대비
                let errorMessage = '일기 목록을 불러오는데 실패했습니다.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // JSON 파싱 실패 시 상태 코드로 메시지 생성
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
                //  수정: JSON 파싱 실패 대비
                let errorMessage = '일기를 불러오는데 실패했습니다.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // JSON 파싱 실패 무시
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

        try {
            const response = await fetch(
                `/api/users/${user.userId}/diaries`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        title,
                        content,
                        category: category || '',
                        emotion: emotion || '',
                        tags: tags || [],
                        date: date || new Date().toISOString().split('T')[0]
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '일기 작성에 실패했습니다.');
                return { success: false, error: errorData.message };
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
                        emotion: emotion || ''
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '일기 수정에 실패했습니다.');
                return { success: false, error: errorData.message };
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
                const errorData = await response.json();
                setError(errorData.message || '일기 삭제에 실패했습니다.');
                return { success: false, error: errorData.message };
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
        clearError
    };
};