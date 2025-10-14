import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    RefreshCw,
    Check,
    X
} from 'lucide-react';
import {useNavigate} from "react-router-dom";
import { useNotificationAPI } from '../../hooks/notificationAPI';

/**
 * FixedSidebar 컴포넌트
 * - 모든 페이지에서 공통으로 사용되는 고정된 사이드바 레이아웃
 * - 사용자 프로필, 알림, 모드(베타), 설정, 도움말
 * - API 연동 가능한 알림 시스템
 */
const FixedSidebar = ({ currentUser }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [activeNotificationTab, setActiveNotificationTab] = useState('전체');

    // 알림 관련 상태
    const [notifications, setNotifications] = useState([]);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [notificationError, setNotificationError] = useState(null);

    // 설정 상태
    const [settings, setSettings] = useState({
        // 계정 설정
        username: currentUser?.username || '',
        email: currentUser?.email || '',
        communityNickname: currentUser?.communityNickname || '',

        // 알림 설정
        plannerNotifications: true,
        trackerNotifications: true,
        communityNotifications: true,
        emailNotifications: false,
        soundEnabled: true,

        // 개인정보 설정
        profileVisibility: 'public',
        showOnlineStatus: true,
        allowDirectMessages: true
    });

    const profileMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);

    // API 훅 사용
    const notificationAPI = useNotificationAPI();

    // 알림 데이터 로드
    const loadNotifications = useCallback(async (category = null) => {
        setIsLoadingNotifications(true);
        setNotificationError(null);

        try {
            let data;
            if (category && category !== '전체') {
                // 카테고리별 조회
                const categoryMap = {
                    '공유 플래너': 'planner',
                    '트래커': 'tracker',
                    '커뮤니티': 'community'
                };
                data = await notificationAPI.getNotificationsByCategory(categoryMap[category]);
            } else {
                // 전체 조회
                data = await notificationAPI.getAllNotifications();
            }
            setNotifications(data);
            // 읽지 않은 알림 여부 확인
            checkUnreadNotifications();
        } catch (error) {
            console.error('알림 로드 실패:', error);
            setNotificationError('알림을 불러오는데 실패했습니다.');
        } finally {
            setIsLoadingNotifications(false);
        }
    }, [notificationAPI]);

    // 읽지 않은 알림 여부 확인
    const checkUnreadNotifications = useCallback(async () => {
        try {
            if (notificationAPI.hasUnreadNotifications) {
                const hasUnread = await notificationAPI.hasUnreadNotifications();
                setHasUnreadNotifications(hasUnread);
            } else {
                // API가 없으면 로컬 상태에서 확인
                const hasUnread = notifications.some(n => !n.isRead);
                setHasUnreadNotifications(hasUnread);
            }
        } catch (error) {
            console.error('읽지 않은 알림 확인 실패:', error);
        }
    }, [notificationAPI, notifications]);

    // 개별 알림 읽음 처리
    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationAPI.markNotificationAsRead(notificationId);
            // 로컬 상태 업데이트
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            checkUnreadNotifications(); // 읽지 않은 알림 여부 업데이트
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
        }
    };

    // 모든 알림 읽음 처리
    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllNotificationsAsRead();
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            setHasUnreadNotifications(false);
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
        }
    };

    // 설정 변경 핸들러
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // 설정 저장
    const handleSaveSettings = () => {
        // 설정 저장 로직
        console.log('설정 저장:', settings);
        setShowSettingsModal(false);
    };

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        checkUnreadNotifications();

        // 실시간 알림 구독 (있는 경우에만)
        if (notificationAPI.subscribeToNotifications) {
            const unsubscribe = notificationAPI.subscribeToNotifications((newNotification) => {
                // 새 알림이 도착했을 때 처리
                setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // 최근 10개 유지
                setHasUnreadNotifications(true);
            });
            return unsubscribe;
        }
    }, [checkUnreadNotifications, notificationAPI]);

    // 탭 변경 시 알림 다시 로드
    useEffect(() => {
        if (showNotificationMenu) {
            loadNotifications(activeNotificationTab);
        }
    }, [activeNotificationTab, showNotificationMenu, loadNotifications]);

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

        if (!showNotificationMenu) {
            // 메뉴가 열릴 때 알림 로드
            loadNotifications(activeNotificationTab);
        }
    };

    // 설정 모달 열기
    const handleSettingsClick = () => {
        setShowSettingsModal(true);
        setShowProfileMenu(false);
        setShowNotificationMenu(false);
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

    // 토글 스위치 컴포넌트
    const ToggleSetting = ({ label, description, checked, onChange }) => {
        return (
            <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                    <p className="font-medium text-gray-800">{label}</p>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
                <button
                    onClick={() => onChange(!checked)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                        checked ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                >
                    <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                            checked ? 'transform translate-x-6' : ''
                        }`}
                    />
                </button>
            </div>
        );
    };

    return (
        <>
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
                                        <p className="font-medium text-gray-800">{currentUser.communityNickname}</p>
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
                            {hasUnreadNotifications && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                            )}
                        </button>

                        {/* 알림 팝업 메뉴 */}
                        {showNotificationMenu && (
                            <div className="absolute left-16 top-0 ml-2 bg-white rounded-lg shadow-xl border w-96 z-50">
                                {/* 헤더 */}
                                <div className="px-4 py-3 border-b flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">알림</h3>
                                    <button
                                        onClick={() => loadNotifications(activeNotificationTab)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                        disabled={isLoadingNotifications}
                                    >
                                        <RefreshCw size={16} className={`text-gray-500 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>

                                {/* 탭 메뉴 */}
                                <div className="flex border-b">
                                    {['전체', '공유 플래너', '트래커', '커뮤니티'].map((tab) => (
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
                                    {isLoadingNotifications ? (
                                        <div className="px-4 py-8 text-center">
                                            <RefreshCw size={24} className="mx-auto mb-2 text-gray-300 animate-spin" />
                                            <p className="text-sm text-gray-500">로딩중...</p>
                                        </div>
                                    ) : notificationError ? (
                                        <div className="px-4 py-8 text-center text-red-500">
                                            <p className="text-sm">{notificationError}</p>
                                            <button
                                                onClick={() => loadNotifications(activeNotificationTab)}
                                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                다시 시도
                                            </button>
                                        </div>
                                    ) : notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer group ${
                                                    !notification.isRead ? 'bg-blue-50' : ''
                                                }`}
                                                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                                        !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}></div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-800">{notification.message}</p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                                {notification.type}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{notification.time}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkAsRead(notification.id);
                                                                }}
                                                                className="p-1 hover:bg-gray-200 rounded"
                                                                title="읽음 처리"
                                                            >
                                                                <Check size={14} className="text-green-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                            <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">새로운 알림이 없습니다</p>
                                        </div>
                                    )}
                                </div>

                                {/* 푸터 */}
                                {notifications.some(n => !n.isRead) && (
                                    <div className="px-4 py-2 border-t bg-gray-50">
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            모든 알림 읽음 처리
                                        </button>
                                    </div>
                                )}
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
                    <button
                        onClick={handleSettingsClick}
                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group"
                    >
                        <Settings size={18} className="text-gray-400 group-hover:text-white" />
                    </button>

                    {/* 도움말 */}
                    <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group">
                        <HelpCircle size={18} className="text-gray-400 group-hover:text-white" />
                    </button>
                </div>
            </div>

            {/* 설정 모달 */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* 배경 오버레이 */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setShowSettingsModal(false)}
                    ></div>

                    {/* 모달 컨텐츠 */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">설정</h2>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* 설정 내용 */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* 계정 설정 */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">계정 정보</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            사용자 이름
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.username}
                                            onChange={(e) => handleSettingChange('username', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            이메일
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            onChange={(e) => handleSettingChange('email', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            커뮤니티 닉네임
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.communityNickname}
                                            onChange={(e) => handleSettingChange('communityNickname', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="커뮤니티에서 사용할 닉네임"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                            비밀번호 변경
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 알림 설정 */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">알림 설정</h3>
                                <div className="space-y-1">
                                    <ToggleSetting
                                        label="공유 플래너 알림"
                                        description="공유 플래너 관련 알림"
                                        checked={settings.plannerNotifications}
                                        onChange={(checked) => handleSettingChange('plannerNotifications', checked)}
                                    />
                                    <ToggleSetting
                                        label="트래커 알림"
                                        description="내일의 나에게 메시지 도착 시 알림"
                                        checked={settings.trackerNotifications}
                                        onChange={(checked) => handleSettingChange('trackerNotifications', checked)}
                                    />
                                    <ToggleSetting
                                        label="커뮤니티 알림"
                                        description="댓글, 좋아요 등 활동 알림"
                                        checked={settings.communityNotifications}
                                        onChange={(checked) => handleSettingChange('communityNotifications', checked)}
                                    />
                                    <ToggleSetting
                                        label="이메일 알림"
                                        description="중요한 알림을 이메일로 받기"
                                        checked={settings.emailNotifications}
                                        onChange={(checked) => handleSettingChange('emailNotifications', checked)}
                                    />
                                </div>
                            </div>

                            {/* 개인정보 설정 */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">개인정보 보호</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            프로필 공개 범위
                                        </label>
                                        <select
                                            value={settings.profileVisibility}
                                            onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="public">전체 공개</option>
                                            <option value="friends">친구만</option>
                                            <option value="private">비공개</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                                            계정 삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 푸터 */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FixedSidebar;