import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// 중복 id 체크
const useLoginId = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);
    const [error, setError] = useState('');

    // 로그인 ID 중복 체크
    const checkLoginId = useCallback(async (loginId) => {
        if (!loginId.trim()) {
            setError('로그인 ID를 입력해주세요.');
            return { success: false };
        }

        setIsChecking(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/check-id/${loginId}`);
            const isDuplicate = await response.json();
            const available = !isDuplicate; // API가 중복이면 true, 사용가능하면 false 반환

            setIsAvailable(available);
            return { success: true, available };
        } catch (error) {
            console.error('로그인 ID 중복 체크 오류:', error);
            setError('로그인 ID 중복 체크 중 오류가 발생했습니다.');
            return { success: false, error: '로그인 ID 중복 체크 중 오류가 발생했습니다.' };
        } finally {
            setIsChecking(false);
        }
    }, []); // loginId가 인수로 들어오므로 의존성 배열에서 제거

    // 상태 초기화
    const resetState = useCallback(() => {
        if (error !== '') setError('');
        if (isAvailable !== null) setIsAvailable(null);
    }, [error, isAvailable]);

    return {
        checkLoginId,
        isChecking,
        isAvailable,
        error,
        resetState
    };
};

export default useLoginId;