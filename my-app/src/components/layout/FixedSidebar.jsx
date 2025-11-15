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
    X
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useNotificationAPI } from '../../hooks/notificationAPI';
import { useAuth } from '../../hooks/AuthContext';

/**
 * NotificationItem 컴포넌트 - 개별 알림 아이템
 */
const NotificationItem = ({ notification }) => {
    // NotificationType enum을 한글로 매핑
    const getTypeLabel = (type) => {
        const typeMap = {
            'FOLLOW': '팔로우',
            'SCHEDULE': '공유 플래너',
            'FOR_ME_TOMORROW': '트래커'
        };
        return typeMap[type] || type;
    };

    // 시간 포맷팅 함수
    const formatTime = (scheduledTime) => {
        if (!scheduledTime) return '';

        const now = new Date();
        const notificationTime = new Date(scheduledTime);
        const diffMs = now - notificationTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;

        return notificationTime.toLocaleDateString();
    };

    return (
        <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
            <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    notification.isSent ? 'bg-gray-300' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{notification.title || '알림'}</p>
                    <p className="text-sm text-gray-600">{notification.content}</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {getTypeLabel(notification.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatTime(notification.scheduledTime)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * NotificationMenu 컴포넌트 - 알림 메뉴
 */
const NotificationMenu = ({ notificationAPI, onClose }) => {
    const [activeTab, setActiveTab] = useState('전체');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // NotificationType 매핑
    const tabTypeMap = {
        '전체': null,
        '공유 플래너': 'SCHEDULE',
        '트래커': 'FOR_ME_TOMORROW',
        '팔로우': 'FOLLOW'
    };

    // 알림 로드
    const loadNotifications = useCallback(async (tab) => {
        setIsLoading(true);
        setError(null);

        try {
            let data;
            const type = tabTypeMap[tab];

            if (type) {
                data = await notificationAPI.getNotificationsByType(type);
            } else {
                data = await notificationAPI.getAllNotifications();
            }

            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('알림 로드 실패:', error);
            setError('알림을 불러오는데 실패했습니다.');
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, [notificationAPI]);

    // 탭 변경 시 알림 로드
    useEffect(() => {
        loadNotifications(activeTab);
    }, [activeTab, loadNotifications]);

    return (
        <div className="absolute left-16 top-0 ml-2 bg-white rounded-lg shadow-xl border w-96 z-50">
            {/* 헤더 */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">알림</h3>
                <button
                    onClick={() => loadNotifications(activeTab)}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={isLoading}
                >
                    <RefreshCw size={16} className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex border-b">
                {['전체', '공유 플래너', '트래커', '팔로우'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                            activeTab === tab
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 알림 목록 */}
            <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="px-4 py-8 text-center">
                        <RefreshCw size={24} className="mx-auto mb-2 text-gray-300 animate-spin" />
                        <p className="text-sm text-gray-500">로딩중...</p>
                    </div>
                ) : error ? (
                    <div className="px-4 py-8 text-center text-red-500">
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => loadNotifications(activeTab)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            다시 시도
                        </button>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                        />
                    ))
                ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                        <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">새로운 알림이 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * ProfileMenu 컴포넌트 - 프로필 드롭다운
 */
const ProfileMenu = ({ currentUser, onLogout }) => {
    return (
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
                        <p className="font-medium text-gray-800">{currentUser?.username || '사용자'}</p>
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
                        <p className="font-medium text-gray-800">{currentUser?.communityNickname || '닉네임'}</p>
                    </div>
                </div>
            </div>

            <hr className="my-2" />
            <div className="px-2">
                {/* 로그아웃 버튼 */}
                <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 rounded-lg flex items-center space-x-2 text-red-600"
                >
                    <LogOut size={16} />
                    <span>로그아웃</span>
                </button>
            </div>
        </div>
    );
};

/**
 * SettingsModal 컴포넌트 - 설정 모달
 */
const SettingsModal = ({ settings, onSettingChange, onSave, onClose }) => {
    const ToggleSetting = ({ label, description, checked, onChange }) => (
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

            {/* 모달 컨텐츠 */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">설정</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                                    onChange={(e) => onSettingChange('username', e.target.value)}
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
                                    onChange={(e) => onSettingChange('email', e.target.value)}
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
                                    onChange={(e) => onSettingChange('communityNickname', e.target.value)}
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
                                onChange={(checked) => onSettingChange('plannerNotifications', checked)}
                            />
                            <ToggleSetting
                                label="트래커 알림"
                                description="내일의 나에게 메시지 도착 시 알림"
                                checked={settings.trackerNotifications}
                                onChange={(checked) => onSettingChange('trackerNotifications', checked)}
                            />
                            <ToggleSetting
                                label="팔로우 알림"
                                description="새로운 팔로워 알림"
                                checked={settings.followNotifications}
                                onChange={(checked) => onSettingChange('followNotifications', checked)}
                            />
                            <ToggleSetting
                                label="이메일 알림"
                                description="중요한 알림을 이메일로 받기"
                                checked={settings.emailNotifications}
                                onChange={(checked) => onSettingChange('emailNotifications', checked)}
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
                                    onChange={(e) => onSettingChange('profileVisibility', e.target.value)}
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
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={onSave}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * FixedSidebar 메인 컴포넌트
 */
const FixedSidebar = ({ currentUser }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const { clearAllStorage } = useAuth();
    const navigate = useNavigate();
    const notificationAPI = useNotificationAPI();

    // 설정 상태
    const [settings, setSettings] = useState({
        username: currentUser?.username || '',
        email: currentUser?.email || '',
        communityNickname: currentUser?.communityNickname || '',
        plannerNotifications: true,
        trackerNotifications: true,
        followNotifications: true,
        emailNotifications: false,
        profileVisibility: 'public',
    });

    const profileMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);

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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
        setShowNotificationMenu(false);
    };

    const handleNotificationClick = () => {
        setShowNotificationMenu(!showNotificationMenu);
        setShowProfileMenu(false);
    };

    const handleSettingsClick = () => {
        setShowSettingsModal(true);
        setShowProfileMenu(false);
        setShowNotificationMenu(false);
    };

    const handleLogout = () => {
        clearAllStorage();
        console.log('로그아웃');
        navigate('/auth');
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = () => {
        console.log('설정 저장:', settings);
        // TODO: 설정 저장 API 호출
        setShowSettingsModal(false);
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

                    {showProfileMenu && (
                        <ProfileMenu currentUser={currentUser} onLogout={handleLogout} />
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
                        </button>

                        {showNotificationMenu && (
                            <NotificationMenu
                                notificationAPI={notificationAPI}
                                onClose={() => setShowNotificationMenu(false)}
                            />
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
                <SettingsModal
                    settings={settings}
                    onSettingChange={handleSettingChange}
                    onSave={handleSaveSettings}
                    onClose={() => setShowSettingsModal(false)}
                />
            )}
        </>
    );
};

export default FixedSidebar;