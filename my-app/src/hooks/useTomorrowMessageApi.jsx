// src/hooks/useTomorrowMessageApi.jsx
import { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const useTomorrowMessageApi = () => {
    const { getAuthHeaders, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 미래 메시지 조회
    const getTomorrowMessage = useCallback(async () => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/users/${user.userId}/future-message`, // url 수정
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '메시지를 불러오는데 실패했습니다.');
                return { success: false, error: errorData.message };
            }
        } catch (error) {
            console.error('미래 메시지 조회 오류:', error);
            setError('메시지를 불러오는 중 오류가 발생했습니다.');
            return { success: false, error: '메시지를 불러오는 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    // 미래 메시지 생성
    const createTomorrowMessage = useCallback(async (messageData) => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        const { content, scheduledTime } = messageData;

        if (!content || !scheduledTime) {
            setError('메시지 내용과 예약 시간은 필수입니다.');
            return { success: false, error: '메시지 내용과 예약 시간은 필수입니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/users/${user.userId}/future-message`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        content,
                        scheduledTime
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '메시지 생성에 실패했습니다.');
                return { success: false, error: errorData.message };
            }
        } catch (error) {
            console.error('미래 메시지 생성 오류:', error);
            setError('메시지 생성 중 오류가 발생했습니다.');
            return { success: false, error: '메시지 생성 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    // 미래 메시지 수정
    const updateTomorrowMessage = useCallback(async (messageData) => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        const { messageId, content, scheduledTime } = messageData;

        if (!messageId) {
            setError('메시지 ID가 필요합니다.');
            return { success: false, error: '메시지 ID가 필요합니다.' };
        }

        if (!content || !scheduledTime) {
            setError('메시지 내용과 예약 시간은 필수입니다.');
            return { success: false, error: '메시지 내용과 예약 시간은 필수입니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/users/${user.userId}/future-message`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        messageId,
                        content,
                        scheduledTime
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '메시지 수정에 실패했습니다.');
                return { success: false, error: errorData.message };
            }
        } catch (error) {
            console.error('미래 메시지 수정 오류:', error);
            setError('메시지 수정 중 오류가 발생했습니다.');
            return { success: false, error: '메시지 수정 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    // 미래 메시지 삭제
    const deleteTomorrowMessage = useCallback(async () => {
        if (!user?.userId) {
            setError('로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(
                `/api/users/${user.userId}/future-message`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );

            if (response.ok || response.status === 204) {
                return { success: true };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '메시지 삭제에 실패했습니다.');
                return { success: false, error: errorData.message };
            }
        } catch (error) {
            console.error('미래 메시지 삭제 오류:', error);
            setError('메시지 삭제 중 오류가 발생했습니다.');
            return { success: false, error: '메시지 삭제 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, user]);

    const clearError = () => setError('');

    return {
        isLoading,
        error,
        getTomorrowMessage,
        createTomorrowMessage,
        updateTomorrowMessage,
        deleteTomorrowMessage,
        clearError
    };
};