import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext';
import useLoginId from '../../../hooks/useLoginId';

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
    const { login, signup, isLoading, error, clearError } = useAuth();
    const {
        checkLoginId,
        isChecking: loginIdChecking,
        isAvailable: loginIdAvailable,
        resetState: resetLoginIdState
    } = useLoginId();

    // OAuth 콜백 처리 로직 추가
    useEffect(() => {
        // URL fragment에서 토큰 추출
        const hash = window.location.hash;

        if (hash) {
            console.log('감지된 URL hash:', hash);

            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('token');

            if (accessToken) {
                console.log('OAuth 토큰 감지:', accessToken);

                localStorage.setItem('accessToken', accessToken);
                window.history.replaceState(null, '', window.location.pathname);

                alert('구글 로그인 성공!');
                window.location.reload(); // 새로고침
            }
        }
    }, []);

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
            // 로그인 성공 시 사용자 정보 표시
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
            return <MainAuthPage  setCurrentPage={(page) => {
                resetForm();
                setCurrentPage(page);
            }}
            />;
    }
};

export default AuthPage;