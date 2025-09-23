import React, { useState, useRef, useEffect } from 'react';
import {
    User,
    Settings,
    HelpCircle,
    Bell,
    Moon,
    Sun,
    LogOut,
    Edit3,
    Users,
} from 'lucide-react';
import {useNavigate} from "react-router-dom";

/**
 * FixedSidebar 컴포넌트
 * - 모든 페이지에서 공통으로 사용되는 고정된 사이드바 레이아웃
 * - 사용자 프로필, 알림, 모드(베타), 설정, 도움말
 */
const FixedSidebar = ({ currentUser }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [activeNotificationTab, setActiveNotificationTab] = useState('전체');

    const profileMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        // 다크모드 토글 로직 구현해야
    };

    // 프로필 메뉴 토글
    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
        setShowNotificationMenu(false); // 다른 메뉴 닫기
    };

    // 알림 메뉴 토글
    const handleNotificationClick = () => {
        setShowNotificationMenu(!showNotificationMenu);
        setShowProfileMenu(false); // 다른 메뉴 닫기
    };

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
                setShowNotificationMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navigate = useNavigate();
    const handleLogout = () => {
        // 로그아웃 로직 구현해야
        console.log('로그아웃');
        navigate('/auth');
    };

    // 더미 알림 데이터
    const getNotificationsByTab = (tab) => {
        const notifications = {
            '전체': [
                { id: 1, type: '채팅방', message: '새로운 메시지가 도착했습니다.', time: '2분 전' },
                { id: 2, type: '트래커', message: '어제의 나에게로부터 메시지가 도착했습니다!', time: '5분 전' },
                { id: 3, type: '커뮤니티', message: '새로운 댓글이 달렸습니다.', time: '10분 전' },
            ],
            '채팅방': [
                { id: 1, type: '채팅방', message: '새로운 메시지가 도착했습니다.', time: '2분 전' },
            ],
            '트래커': [
                { id: 1, type: '트래커', message: '어제의 나에게로부터 메시지가 도착했습니다!', time: '5분 전' },
            ],
            '커뮤니티': [
                { id: 1, type: '커뮤니티', message: '새로운 댓글이 달렸습니다.', time: '10분 전' },
            ]
        };
        return notifications[tab] || [];
    };

    return (
        <div className="w-16 bg-white flex flex-col items-center py-4">
            {/* 프로필 섹션 */}
            <div className="relative mb-6" ref={profileMenuRef}>
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
                            {/* 로그아웃 버튼 */}
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
                <div className="relative" ref={notificationMenuRef}>
                    <button
                        onClick={handleNotificationClick}
                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group relative"
                    >
                        <Bell size={18} className="text-gray-400 group-hover:text-white" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </button>

                    {/* 알림 팝업 메뉴 */}
                    {showNotificationMenu && (
                        <div className="absolute left-16 top-0 ml-2 bg-white rounded-lg shadow-xl border w-80 z-50">
                            {/* 헤더 */}
                            <div className="px-4 py-3 border-b">
                                <h3 className="text-lg font-semibold text-gray-800">알림</h3>
                            </div>

                            {/* 탭 메뉴 */}
                            <div className="flex border-b">
                                {['전체', '채팅방', '트래커', '커뮤니티'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveNotificationTab(tab)}
                                        className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                                            activeNotificationTab === tab
                                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span>{tab}</span>
                                    </button>
                                ))}
                            </div>

                            {/* 알림 목록 */}
                            <div className="max-h-64 overflow-y-auto">
                                {getNotificationsByTab(activeNotificationTab).map((notification) => (
                                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800">{notification.message}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                        {notification.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{notification.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {getNotificationsByTab(activeNotificationTab).length === 0 && (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">새로운 알림이 없습니다</p>
                                    </div>
                                )}
                            </div>

                            {/* 푸터 */}
                            <div className="px-4 py-2 border-t bg-gray-50">
                                <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    모든 알림 읽음 처리
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 다크모드 토글 버튼 */}
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