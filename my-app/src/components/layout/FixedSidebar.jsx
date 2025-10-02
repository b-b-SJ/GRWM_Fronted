import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationAPI } from "../../hooks/notificationAPI";

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
  const [activeNotificationTab, setActiveNotificationTab] = useState("전체");

  // 알림 관련 상태
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  // API 훅 사용
  const notificationAPI = useNotificationAPI();

  // 알림 데이터 로드
  const loadNotifications = useCallback(
    async (category = null) => {
      setIsLoadingNotifications(true);
      setNotificationError(null);

      try {
        let data;
        if (category && category !== "전체") {
          // 카테고리별 조회
          const categoryMap = {
            채팅방: "chat",
            트래커: "tracker",
            커뮤니티: "community",
          };
          data = await notificationAPI.getNotificationsByCategory(
            categoryMap[category]
          );
        } else {
          // 전체 조회
          data = await notificationAPI.getAllNotifications();
        }
        setNotifications(data);
        // 읽지 않은 알림 여부 확인
        checkUnreadNotifications();
      } catch (error) {
        console.error("알림 로드 실패:", error);
        setNotificationError("알림을 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingNotifications(false);
      }
    },
    [notificationAPI]
  );

  // 읽지 않은 알림 여부 확인
  const checkUnreadNotifications = useCallback(async () => {
    try {
      if (notificationAPI.hasUnreadNotifications) {
        const hasUnread = await notificationAPI.hasUnreadNotifications();
        setHasUnreadNotifications(hasUnread);
      } else {
        // API가 없으면 로컬 상태에서 확인
        const hasUnread = notifications.some((n) => !n.isRead);
        setHasUnreadNotifications(hasUnread);
      }
    } catch (error) {
      console.error("읽지 않은 알림 확인 실패:", error);
    }
  }, [notificationAPI, notifications]);

  // 개별 알림 읽음 처리
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markNotificationAsRead(notificationId);
      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      checkUnreadNotifications(); // 읽지 않은 알림 여부 업데이트
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setHasUnreadNotifications(false);
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    checkUnreadNotifications();

    // 실시간 알림 구독 (있는 경우에만)
    if (notificationAPI.subscribeToNotifications) {
      const unsubscribe = notificationAPI.subscribeToNotifications(
        (newNotification) => {
          // 새 알림이 도착했을 때 처리
          setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]); // 최근 10개 유지
          setHasUnreadNotifications(true);
        }
      );
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

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setShowNotificationMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();
  const handleLogout = () => {
    // 로그아웃 로직 구현해야
    console.log("로그아웃");
    navigate("/auth");
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
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  기본 프로필
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit3 size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {currentUser.username}
                  </p>
                </div>
              </div>
            </div>

            {/* 커뮤니티 프로필 */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  커뮤니티 프로필
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit3 size={14} className="text-gray-500" />
                </button>
              </div>
              <div
                className="flex items-center space-x-3"
                onClick={() => navigate("/profile/:communityId")}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {currentUser.communityNickname || "스터디러버"}
                  </p>
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
            {hasUnreadNotifications && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </button>

          {/* 알림 팝업 메뉴 */}
          {showNotificationMenu && (
            <div className="absolute left-16 top-0 ml-2 bg-white rounded-lg shadow-xl border w-80 z-50">
              {/* 헤더 */}
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">알림</h3>
                <button
                  onClick={() => loadNotifications(activeNotificationTab)}
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={isLoadingNotifications}
                >
                  <RefreshCw
                    size={16}
                    className={`text-gray-500 ${
                      isLoadingNotifications ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>

              {/* 탭 메뉴 */}
              <div className="flex border-b">
                {["전체", "채팅방", "트래커", "커뮤니티"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveNotificationTab(tab)}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                      activeNotificationTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
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
                    <RefreshCw
                      size={24}
                      className="mx-auto mb-2 text-gray-300 animate-spin"
                    />
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
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() =>
                        !notification.isRead &&
                        handleMarkAsRead(notification.id)
                      }
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            !notification.isRead ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {notification.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {notification.time}
                            </span>
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
              {notifications.some((n) => !n.isRead) && (
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
        <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group">
          <Settings
            size={18}
            className="text-gray-400 group-hover:text-white"
          />
        </button>

        {/* 도움말 */}
        <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors group">
          <HelpCircle
            size={18}
            className="text-gray-400 group-hover:text-white"
          />
        </button>
      </div>
    </div>
  );
};

export default FixedSidebar;
