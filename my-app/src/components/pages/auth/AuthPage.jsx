import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext';
import useLoginId from '../../../hooks/useLoginId';
import { setupFCMListener } from '../../../hooks/useFCM';

// 분리된 컴포넌트 import
import MainAuthPage from './MainAuthPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

const AuthPage = () => {
    const [currentPage, setCurrentPage] = useState('main'); // 'main', 'login', 'signup'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        loginId: ''
    });

    // Hooks
    const { login, signup, isLoading, error, clearError, handleOAuthLogin, refreshFcmToken } = useAuth();
    const {
        checkLoginId,
        isChecking: loginIdChecking,
        isAvailable: loginIdAvailable,
        resetState: resetLoginIdState
    } = useLoginId();

    useEffect(() => {
        setupFCMListener();
    }, []);

    // OAuth 콜백 처리 로직 개선
    useEffect(() => {
        // URL fragment에서 토큰 추출
        const hash = window.location.hash;

        if (hash) {
            console.log('감지된 URL hash:', hash);

            // 1. URLSearchParams 객체 생성 시 '#' 제거
            const params = new URLSearchParams(hash.substring(1));

            // 2. 4가지 정보 모두 파싱
            const accessToken = params.get('token');
            const userId = params.get('userId');
            const encodedUsername = params.get('username');
            const encodedNickname = params.get('communityNickname'); // 인코딩된 닉네임 파싱

            if (accessToken && userId && encodedUsername && encodedNickname) {

                // 3. 이름 및 닉네임 디코딩 (두 값 모두 인코딩되어 넘어옴)
                const username = decodeURIComponent(encodedUsername);
                const communityNickname = decodeURIComponent(encodedNickname);

                console.log('OAuth 정보 감지:', { accessToken, userId, username, communityNickname });

                // 4. AuthContext로 디코딩된 정보 전달
                handleOAuthLogin({ accessToken, userId, username, communityNickname }).then(result => {
                    if (result.success) {

                        refreshFcmToken(userId); // fcm 토큰
                        // URL에서 hash 제거
                        window.history.replaceState(null, '', window.location.pathname);

                        navigate('/main', { replace: true });
                    } else {
                        alert('로그인 처리 중 오류가 발생했습니다.');
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                });
            }
        }
    }, [handleOAuthLogin, navigate, refreshFcmToken]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'loginId' && loginIdAvailable !== null) {
            resetLoginIdState();
        }

        clearError();
    };

    // 로그인 관리
    const handleLogin = async () => {
        const result = await login(formData.loginId, formData.password);

        if (result.success) {
            const welcomeMessage = result.data.username
                ? `환영합니다, ${result.data.username}님! 메인 페이지로 이동합니다.`
                : '로그인 성공! 메인 페이지로 이동합니다.';

            alert(welcomeMessage);
            navigate('/main');
        }
    };

    // 회원가입 관리
    const handleSignup = async () => {
        if (formData.password !== formData.confirmPassword) {
            clearError();
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (loginIdAvailable !== true) {
            alert('로그인 ID 중복 확인을 해주세요.');
            return;
        }

        const result = await signup(formData);
        if (result.success) {
            alert(`회원가입 성공! 로그인 페이지로 이동합니다.`);
            setCurrentPage('login');
            setFormData({
                email: formData.email,
                password: '',
                confirmPassword: '',
                username: '',
                loginId: ''
            });
            resetLoginIdState();
        }
    };

    // 폼 데이터를 초기화하는 함수
    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            loginId: ''
        });
        clearError();
        resetLoginIdState();
    };

    const handleCheckLoginId = async () => {
        await checkLoginId(formData.loginId);
    };

    switch (currentPage) {
        case 'login':
            return (
                <LoginPage
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleLogin={handleLogin}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    isLoading={isLoading}
                    error={error}
                    setCurrentPage={(page) => {
                        resetForm();
                        setCurrentPage(page);
                    }}
                />
            );
        case 'signup':
            return (
                <SignupPage
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSignup={handleSignup}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowPassword={setShowPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                    loginIdAvailable={loginIdAvailable}
                    loginIdChecking={loginIdChecking}
                    handleCheckLoginId={handleCheckLoginId}
                    isLoading={isLoading}
                    error={error}
                    setCurrentPage={setCurrentPage}
                />
            );
        default:
            return <MainAuthPage setCurrentPage={(page) => {
                resetForm();
                setCurrentPage(page);
            }}
            />;
    }
};

export default AuthPage;