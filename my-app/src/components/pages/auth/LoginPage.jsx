import React from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, User } from 'lucide-react';

const LoginPage = ({
                       formData,
                       handleInputChange,
                       handleLogin,
                       showPassword,
                       setShowPassword,
                       isLoading,
                       error,
                       setCurrentPage,
                   }) => {

    const handleSubmit = (event) => {
        event.preventDefault(); // 새로고침 방지
        handleLogin(); // 로그인 관리
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={() => setCurrentPage('main')}
                    className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2"/>
                    뒤로가기
                </button>

                {/* 로그인 폼 */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">로그인</h2>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 아이디 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                아이디
                            </label>
                            <div className="relative">
                                <User
                                    size={20}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    name="loginId"
                                    value={formData.loginId}
                                    onChange={handleInputChange}
                                    placeholder="아이디를 입력하세요"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    disabled={isLoading}
                                    autoComplete="current-id"
                                />
                            </div>
                        </div>

                        {/* 비밀번호 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                비밀번호
                            </label>
                            <div className="relative">
                                <Lock
                                    size={20}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="비밀번호를 입력하세요"
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>

                        {/* 비밀번호 찾기 */}
                        <div className="text-right">
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                disabled={isLoading}
                            >
                                비밀번호를 잊으셨나요?
                            </button>
                        </div>

                        {/* 로그인 버튼 - submit으로 변경 (엔터 입력) */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className="relative mt-6 mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">또는</span>
                        </div>
                    </div>

                    {/* 소셜 로그인 버튼 */}
                    <div className="space-y-3 mb-6">
                        {/* Google Login */}
                        <a
                            href="http://localhost:8080/oauth2/authorization/google" // 주소 수정
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-disabled={isLoading}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285f4"
                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34a853"
                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#fbbc05"
                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#ea4335"
                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-gray-700 font-medium">Google로 로그인</span>
                        </a>

                        {/* Kakao Login */}
                        <button
                            // onClick={handleKakaoLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#3c1e1e"
                                      d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                            </svg>
                            <span className="text-gray-800 font-medium">카카오로 로그인</span>
                        </button>
                    </div>

                    {/* 회원가입 링크 */}
                    <div className="text-center mt-6">
                        <span className="text-gray-600">계정이 없으신가요? </span>
                        <button
                            onClick={() => setCurrentPage('signup')}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            disabled={isLoading}
                        >
                            회원가입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
