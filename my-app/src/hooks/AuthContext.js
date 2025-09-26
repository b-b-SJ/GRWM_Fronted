// src/hooks/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// 로그인, 회원가입 관리
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null); // 사용자 정보 상태 추가

    // 처음 렌더 시 토큰 확인 및 사용자 정보 복원
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');

        if (accessToken && userData) {
            try {
                const parsedUserData = JSON.parse(userData);
                setIsAuthenticated(true);
                setUser(parsedUserData);
            } catch (error) {
                console.error('사용자 데이터 파싱 오류:', error);
                // 잘못된 데이터가 있다면 정리
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userData');
            }
        }
    }, []);

    const login = async (loginId, password) => {
        if (!loginId || !password) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
            return { success: false };
        }

        setIsLoading(true);
        setError('');

        // 하드코딩 유저 (개발용) - JWT 형식으로 수정 + userId 추가
        if (loginId === 'test' && password === '1234') {
            const mockResponse = {
                tokenType: 'Bearer',
                accessToken: 'dummy-jwt-token',
                username: 'Test User',
                userId: 1 // userId 추가
            };

            // 토큰과 사용자 정보 저장 (userId 포함)
            localStorage.setItem('accessToken', mockResponse.accessToken);
            localStorage.setItem('userData', JSON.stringify({
                userId: mockResponse.userId,
                username: mockResponse.username,
                loginId: loginId
            }));

            setIsAuthenticated(true);
            setUser({
                userId: mockResponse.userId,
                username: mockResponse.username,
                loginId: loginId
            });

            setIsLoading(false);
            return {
                success: true,
                data: {
                    tokenType: mockResponse.tokenType,
                    accessToken: mockResponse.accessToken,
                    username: mockResponse.username,
                    userId: mockResponse.userId
                }
            };
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId, password })
            });

            if (response.ok) {
                const data = await response.json();

                // API 응답에서 tokenType, accessToken, username, userId 추출
                const { tokenType, accessToken, username, userId } = data;

                if (!accessToken) {
                    setError('서버 응답에 토큰이 없습니다.');
                    return { success: false, error: '서버 응답 오류' };
                }

                if (!userId) {
                    setError('서버 응답에 사용자 ID가 없습니다.');
                    return { success: false, error: '서버 응답 오류' };
                }

                // 토큰과 사용자 정보를 localStorage에 저장 (userId 포함)
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('userData', JSON.stringify({
                    userId: userId,
                    username: username,
                    loginId: loginId
                }));

                // 상태 업데이트
                setIsAuthenticated(true);
                setUser({
                    userId: userId,
                    username: username,
                    loginId: loginId
                });

                return {
                    success: true,
                    data: {
                        tokenType,
                        accessToken,
                        username,
                        userId
                    }
                };
            } else {
                const errorData = await response.json();
                setError(errorData.message || '로그인에 실패했습니다.');
                return { success: false, error: errorData.message };
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            setError('ID가 존재하지 않거나 비밀번호가 일치하지 않습니다.');
            return { success: false, error: 'ID가 존재하지 않거나 비밀번호가 일치하지 않습니다.' };
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
            const response = await fetch('/api/auth/signup', {
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
        // 토큰과 사용자 정보 모두 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUser(null);
    };

    // API 호출 시 사용할 인증 헤더를 가져오는 헬퍼 함수
    const getAuthHeaders = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            return {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    };

    // 토큰이 유효한지 확인하는 함수 (옵션으로)
    const validateToken = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            logout();
            return false;
        }

        try {
            const response = await fetch('/api/auth/validate', {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('토큰 검증 오류:', error);
            logout();
            return false;
        }
    };

    const clearError = () => setError('');

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            error,
            user, // 사용자 정보 제공
            login,
            signup,
            logout,
            clearError,
            getAuthHeaders, // API 호출용 헤더 함수 제공
            validateToken // 토큰 검증 함수 제공
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);