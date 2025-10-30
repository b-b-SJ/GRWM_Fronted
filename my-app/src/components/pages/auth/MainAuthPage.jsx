import React, { useState, useEffect } from 'react';
import {Link} from "react-router-dom";

const MainAuthPage = ({ setCurrentPage }) => {
    // 컴포넌트 마운트 상태 관리 (애니메이션 트리거용)
    const [mounted, setMounted] = useState(false);
    // 현재 표시중인 기능 인덱스 (로테이션 기능용)
    const [currentFeature, setCurrentFeature] = useState(0);

    // 기능들 배열
    const features = [
        { icon: "📅", text: "일정 플래닝" },
        { icon: "📊", text: "진행 트래킹" },
        { icon: "💪", text: "함께 하는 협업공간" },
        { icon: "💬", text: "정보/일상 공유" }
    ];

    // 컴포넌트 마운트 시 실행되는 효과
    useEffect(() => {
        // 웹폰트 CSS 추가
        const style = document.createElement('style');
        style.textContent = `
           @font-face {
                font-family: 'RomanticGumi';
                src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2410-1@1.0/GumiRomanceTTF.woff2') format('woff2');
                font-weight: normal;
                font-display: swap;
            }
        `;
        document.head.appendChild(style);

        setMounted(true);
        // 2.5초마다 기능 텍스트가 순환하도록 인터벌 설정
        const interval = setInterval(() => {
            setCurrentFeature(prev => (prev + 1) % features.length);
        }, 2500);
        // 컴포넌트 언마운트 시 인터벌 정리
        return () => clearInterval(interval);
    }, [features.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* 메인 컨텐츠 컨테이너) */}
            <div className="max-w-md w-full relative z-10">
                {/* 로고와 타이틀 섹션 (마운트 시 아래에서 위로 페이드인 애니메이션) */}
                <div className={`text-center mb-8 transform transition-all duration-1000 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                    {/* 앱 로고 컨테이너 */}
                    <div className="relative mx-auto mb-6 w-20 h-20">
                        {/* 메인 로고 */}
                        <div
                            className="bg-gradient-to-r from-blue-600 to-sky-600 w-20 h-20 rounded-2xl flex items-center justify-center transform transition-all duration-500">
                            <span className="text-white text-3xl font-bold animate-pulse">🚀</span>
                        </div>
                        {/* 로고 주변을 도는 궤도선 애니메이션 (8초 주기로 회전) */}
                        <div className="absolute inset-0 border-2 border-blue-200 rounded-2xl animate-spin"
                             style={{animationDuration: '8s'}}>
                            {/* 궤도선 위의 작은 점 */}
                            <div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-sky-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* 임시 앱 타이틀 */}
                    <h1
                        className="text-3xl mb-8 whitespace-nowrap"
                        style={{fontFamily: "'RomanticGumi', sans-serif", fontWeight: 100}}
                    >
                        {/* 메인 앱 이름 (모두잉) - 각 글자 둥둥 */}
                        <span className="text-5xl inline-flex space-x-0">
                        {"모두잉".split("").map((char, idx) => (
                            <span
                                key={idx}
                                className="animate-float inline-block bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent"
                                style={{animationDelay: `${idx * 0.3}s`}}
                            >
                            {char}
                          </span>
                        ))}
                      </span>

                        {/* 본문 - 은은하게 */}
                        <span className="ml-2 inline-block animate-gentle text-gray-700">
                        에 오신 걸 환영합니다
                        </span>
                    </h1>

                    {/* 기능 소개 로테이션 섹션*/}
                    <div className="h-12 flex items-center justify-center mb-4">
                        <div className="flex items-center space-x-2 transition-all duration-500">
                            {/* 현재 기능의 이모지 */}
                            <span className="text-2xl animate-bounce" style={{animationDelay: '0.2s'}}>
                                {features[currentFeature].icon}
                            </span>
                            {/* 현재 기능의 텍스트 */}
                            <span className="text-lg font-medium text-gray-700 transition-all duration-500">
                                {features[currentFeature].text}
                            </span>
                        </div>
                    </div>

                    {/* 앱 설명 텍스트 */}
                    <p className="text-gray-600">협업부터 일상까지, 계획부터 기록까지</p>
                </div>

                {/* 기능별 진행률 표시 인디케이터 */}
                <div className="flex justify-center mb-6">
                    <div className="flex space-x-2">
                        {/* 각 기능마다 하나씩 인디케이터 점 생성 */}
                        {features.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    // 현재 표시중인 기능은 파란색으로, 나머지는 회색으로 표시
                                    // 활성화된 인디케이터는 더 넓게(w-6) 표시
                                    index === currentFeature
                                        ? 'bg-blue-500 w-6'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* 로그인/회원가입 버튼 섹션 (0.3초 지연 후 페이드인) */}
                <div className={`space-y-4 transform transition-all duration-1000 delay-300 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                    {/* 로그인 버튼 */}
                    <button
                        onClick={() => setCurrentPage('login')}
                        className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group"
                    >
                        {/* 호버 시 나타나는 오버레이 효과 */}
                        <div
                            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <span className="relative">로그인</span>
                    </button>

                    {/* 회원가입 버튼 */}
                    <button
                        onClick={() => setCurrentPage('signup')}
                        className="w-full bg-white text-blue-600 py-4 px-6 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group"
                    >
                        {/* 호버 시 나타나는 오버레이 효과 */}
                        <div
                            className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                        <span className="relative">회원가입</span>
                    </button>
                </div>

                {/* 개발용 임시 링크 */}
                <div className={`mt-6 text-center transform transition-all duration-1000 delay-700 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                    <button
                        onClick={() => setCurrentPage('/main')}
                        className="text-blue-500 hover:text-blue-700 text-sm underline transition-colors duration-200 bg-transparent border-none cursor-pointer"
                    >
                       <Link to="/main"> 임시 메인화면 이동용 링크입니다. </Link>
                    </button>
                </div>
            </div>

            {/* 하단 웨이브 장식 요소 */}
            <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none">
                <svg
                    viewBox="0 0 1440 120"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)"/>
                            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.3)"/>
                            <stop offset="100%" stopColor="rgba(255, 130, 203, 0.3)"/>
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
                        fill="url(#waveGradient)"
                        className="animate-pulse"
                        style={{animationDuration: '4s'}}
                    />
                </svg>
            </div>
        </div>
    );
};

export default MainAuthPage;