import React from 'react';
import {Link} from "react-router-dom";

const MainAuthPage = ({ setCurrentPage }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
            <div className="text-center mb-8">
                <div
                    className="bg-gradient-to-r from-blue-600 to-sky-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">G</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">GRWM에 오신걸 환영합니다</h1>
                <p className="text-gray-600">계정을 만들거나 로그인하여 시작하세요</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => setCurrentPage('login')}
                    className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    로그인
                </button>
                <button
                    onClick={() => setCurrentPage('signup')}
                    className="w-full bg-white text-blue-600 py-4 px-6 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    회원가입
                </button>
            </div>
            <div>
                <Link to="/main"> 임시 메인화면 이동용 링크입니다. </Link>
            </div>
        </div>
    </div>
);

export default MainAuthPage;
