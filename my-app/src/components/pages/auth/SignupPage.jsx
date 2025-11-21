import React from 'react';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    User,
    Mail,
    Check,
    X,
} from 'lucide-react';

const SignupPage = ({
                        formData,
                        handleInputChange,
                        handleSignup,
                        showPassword,
                        showConfirmPassword,
                        setShowPassword,
                        setShowConfirmPassword,
                        loginIdAvailable,
                        loginIdChecking,
                        handleCheckLoginId,
                        isLoading,
                        error,
                        setCurrentPage,
                    }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={() => setCurrentPage('main')}
                    className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    뒤로가기
                </button>

                {/* 회원가입 폼 */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">회원가입</h2>
                        <p className="text-gray-600">새 계정을 만들어 시작하세요</p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* 사용자명 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                사용자명
                            </label>
                            <div className="relative">
                                <User
                                    size={20}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="사용자명을 입력하세요"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* 로그인 ID 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                로그인 ID
                            </label>
                            <div className="flex space-x-2">
                                <div className="relative flex-1">
                                    <User
                                        size={20}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        name="loginId"
                                        value={formData.loginId}
                                        onChange={handleInputChange}
                                        placeholder="영문 5자 이상"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={handleCheckLoginId}
                                    disabled={!formData.loginId.trim() || loginIdChecking || isLoading}
                                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {loginIdChecking ? '확인중...' : '중복확인'}
                                </button>
                            </div>
                            {/* ID 형식 검증 */}
                            {formData.loginId && !/^[a-zA-Z]{5,}$/.test(formData.loginId) && (
                                <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                    <X size={16} />
                                    <span>영문 5자 이상 입력해주세요.</span>
                                </div>
                            )}

                            {/* 중복 확인 결과 */}
                            {loginIdAvailable !== null && /^[a-zA-Z]{5,}$/.test(formData.loginId) && (
                                <div
                                    className={`mt-2 flex items-center space-x-2 text-sm ${
                                        loginIdAvailable ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    {loginIdAvailable ? <Check size={16} /> : <X size={16} />}
                                    <span>
                    {loginIdAvailable
                        ? '사용 가능한 ID입니다.'
                        : '이미 사용중인 ID입니다.'}
                  </span>
                                </div>
                            )}
                        </div>

                        {/* 이메일 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                이메일
                            </label>
                            <div className="relative">
                                <Mail
                                    size={20}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="이메일을 입력하세요"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    disabled={isLoading}
                                />
                            </div>
                            {/* 이메일 형식 검증 */}
                            {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                                <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                    <X size={16} />
                                    <span>올바른 이메일 형식이 아닙니다.</span>
                                </div>
                            )}
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
                                    placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {/* 비밀번호 형식 검증 */}
                            {formData.password && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.password) && (
                                <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                    <X size={16} />
                                    <span>영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.</span>
                                </div>
                            )}
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                비밀번호 확인
                            </label>
                            <div className="relative">
                                <Lock
                                    size={20}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="비밀번호를 다시 입력하세요"
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formData.password &&
                                formData.confirmPassword &&
                                formData.password !== formData.confirmPassword && (
                                    <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                        <X size={16}/>
                                        <span>비밀번호가 일치하지 않습니다.</span>
                                    </div>
                                )}
                        </div>

                        {/* 약관 동의
                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                <span className="text-blue-600 hover:text-blue-700 cursor-pointer">이용약관</span>과{' '}
                                <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  개인정보처리방침
                </span>
                                에 동의합니다.
                            </label>
                        </div> */}

                        {/* 회원가입 버튼 */}
                        <button
                            onClick={handleSignup}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '회원가입 중...' : '회원가입'}
                        </button>
                    </div>

                    {/* 로그인 링크 */}
                    <div className="text-center mt-6">
                        <span className="text-gray-600">이미 계정이 있으신가요? </span>
                        <button
                            onClick={() => setCurrentPage('login')}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            disabled={isLoading}
                        >
                            로그인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
