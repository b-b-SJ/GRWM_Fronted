import React, { useState } from 'react';
import {
    User,
    Settings,
    HelpCircle,
    Bell,
    Moon,
    Sun,
    LogOut,
    Edit3,
    Users
} from 'lucide-react';

const FixedSidebar = ({ currentUser }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        // 다크모드 토글 로직 구현해야
    };

    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const handleLogout = () => {
        // 로그아웃 로직 구현해야
        console.log('로그아웃');
    };

    return (
        <div className="w-16 bg-white flex flex-col items-center py-4 shadow-lg">
            {/* 프로필 섹션 */}
            <div className="relative mb-6">
                <button
                    onClick={handleProfileClick}
                    className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors group"
                >
                    <User size={20} className="text-white" />
                </button>

                {/* 프로필 드롭다운 메뉴 */}
                {showProfileMenu && (
                    <div className="absolute left-16 top-0 ml-2 bg-white rounded-lg shadow-xl border py-3 w-72 z-50">
                        {/* 기본 프로필 */}
                        <div className="px-4 py-3 border-b">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">기본 프로필</h3>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                    <Edit3 size={14} className="text-gray-500" />
                                </button>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{currentUser.username}</p>

                                </div>
                            </div>
                        </div>

                        {/* 커뮤니티 프로필 */}
                        <div className="px-4 py-3 border-b">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">커뮤니티 프로필</h3>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                    <Edit3 size={14} className="text-gray-500" />
                                </button>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <Users size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{currentUser.communityNickname || '스터디러버'}</p>
                                    <p className="text-sm text-gray-500">커뮤니티 활동 중</p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-2" />
                        <div className="px-2">
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 rounded-lg flex items-center space-x-2 text-red-600"
                            >
                                <LogOut size={16} />
                                <span>로그아웃</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 메인 네비게이션 아이콘들 */}
            <div className="flex-1 flex flex-col items-center space-y-4">
                {/* 알림 */}
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group relative">
                    <Bell size={18} className="text-gray-400 group-hover:text-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>

                {/* 다크모드 토글 */}
                <button
                    onClick={toggleDarkMode}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group"
                >
                    {darkMode ? (
                        <Sun size={18} className="text-gray-400 group-hover:text-white" />
                    ) : (
                        <Moon size={18} className="text-gray-400 group-hover:text-white" />
                    )}
                </button>
            </div>

            {/* 하단 메뉴 */}
            <div className="flex flex-col items-center space-y-4">
                {/* 설정 */}
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group">
                    <Settings size={18} className="text-gray-400 group-hover:text-white" />
                </button>

                {/* 도움말 */}
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group">
                    <HelpCircle size={18} className="text-gray-400 group-hover:text-white" />
                </button>
            </div>
        </div>
    );
};

export default FixedSidebar;