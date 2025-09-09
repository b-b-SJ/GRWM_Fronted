import { useState } from 'react';

// 중복 id 체크
const useLoginId = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);
    const [error, setError] = useState('');

    // 로그인 ID 중복 체크
    const checkLoginId = async (loginId) => {
        if (!loginId.trim()) {
            setError('로그인 ID를 입력해주세요.');
            return { success: false };
        }

        setIsChecking(true);
        setError('');

        try {
            const response = await fetch(`api/auth/check-id/${loginId}`);
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
    };

    // 상태 초기화
    const resetState = () => {
        if (error !== '') setError('');
        if (isAvailable !== null) setIsAvailable(null);
    };

    return {
        checkLoginId,
        isChecking,
        isAvailable,
        error,
        resetState
    };
};

export default useLoginId;