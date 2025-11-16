// src/hooks/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestFCMToken } from './useFCM'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [currentStudyRoomId, setCurrentStudyRoomId] = useState(null); // 현재 참여 중인 방 ID

    // 초기 로드 시 토큰 및 사용자 정보 복원
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');
        const studyRoomId = localStorage.getItem('currentStudyRoomId');

        if (accessToken && userData) {
            try {
                const parsedUserData = JSON.parse(userData);
                setIsAuthenticated(true);
                setUser(parsedUserData);

                // 현재 참여 중인 방 정보 복원
                if (studyRoomId) {
                    setCurrentStudyRoomId(studyRoomId);
                }
            } catch (error) {
                console.error('사용자 데이터 파싱 오류:', error);
                clearAllStorage();
            }
        }
    }, []);

    // 모든 저장소 정리
    const clearAllStorage = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('currentStudyRoomId');
        setIsAuthenticated(false);
        setUser(null);
        setCurrentStudyRoomId(null);
    }, []);

    const login = async (loginId, password) => {
        if (!loginId || !password) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
            return { success: false };
        }

        setIsLoading(true);
        setError('');

        try {
            const fcmToken = await requestFCMToken();
            console.log('FCM 토큰 발급:', fcmToken || '토큰 없음');

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId, password, fcmToken })
            });

            if (response.ok) {
                const data = await response.json();
                const { tokenType, accessToken, username, userId, communityNickname } = data;

                if (!accessToken || !userId) {
                    setError('서버 응답에 필수 정보가 없습니다.');
                    return { success: false, error: '서버 응답 오류' };
                }

                // 새로운 사용자 정보 저장
                const userData = {
                    userId: userId,
                    username: username,
                    loginId: loginId,
                    communityNickname: communityNickname,
                    communityId: userId // communityId 추가 (스터디룸에서 사용)
                };

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('userData', JSON.stringify(userData));

                setIsAuthenticated(true);
                setUser(userData);

                return {
                    success: true,
                    data: {
                        tokenType,
                        accessToken,
                        username,
                        userId,
                        communityNickname
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

    const logout = useCallback(() => {
        console.log('[Auth] 로그아웃 - 모든 데이터 정리');
        clearAllStorage();
    }, [clearAllStorage]);

    // 스터디룸 참여 정보 저장
    const setJoinedStudyRoom = useCallback((studyRoomId) => {
        console.log('[Auth] 스터디룸 참여 정보 저장:', studyRoomId);
        setCurrentStudyRoomId(studyRoomId);
        if (studyRoomId) {
            localStorage.setItem('currentStudyRoomId', studyRoomId);
        } else {
            localStorage.removeItem('currentStudyRoomId');
        }
    }, []);

    // 스터디룸 퇴장 정보 제거
    const clearJoinedStudyRoom = useCallback(() => {
        console.log('[Auth] 스터디룸 참여 정보 제거');
        setCurrentStudyRoomId(null);
        localStorage.removeItem('currentStudyRoomId');
    }, []);

    // API 호출 시 사용할 인증 헤더
    const getAuthHeaders = useCallback(() => {
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
    }, []);

    // 토큰 유효성 검증
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
            user,
            currentStudyRoomId, // 현재 참여 중인 방 ID
            login,
            signup,
            logout,
            clearError,
            getAuthHeaders,
            validateToken,
            clearAllStorage,
            setJoinedStudyRoom, // 스터디룸 참여 정보 저장
            clearJoinedStudyRoom // 스터디룸 참여 정보 제거
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);