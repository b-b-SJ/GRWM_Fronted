// src/hooks/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// 로그인, 회원가입 관리
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 처음 렌더 시 토큰 확인
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
    }, []);

    const login = async (loginId, password) => {
        if (!loginId || !password) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
            return { success: false };
        }

        setIsLoading(true);
        setError('');

        // 하드코딩 유저 (개발용)
        if (loginId === 'test' && password === '1234') {
            localStorage.setItem('authToken', 'dummy-token');
            setIsAuthenticated(true);
            return { success: true, data: { loginId, username: 'Test User' } };
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                setIsAuthenticated(true);
                return { success: true, data };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '로그인에 실패했습니다.');
                return { success: false, error: errorData.message };
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            setError('로그인 중 오류가 발생했습니다.');
            return { success: false, error: '로그인 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async ({ username, loginId, password, email }) => {
        if (!username || !loginId || !password || !email) {
            setError('모든 필드를 입력해주세요.');
            return { success: false };
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/user/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, loginId, password, email })
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, userId: data };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '회원가입에 실패했습니다.');
                return { success: false, error: errorData.message };
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            setError('회원가입 중 오류가 발생했습니다.');
            return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    const clearError = () => setError('');

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            error,
            login,
            signup,
            logout,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
