import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import FixedSidebar from './FixedSidebar';
import { useChatState } from '../../hooks/useChatState';

/**
 * AppLayout 컴포넌트
 * - 애플리케이션의 전체적인 레이아웃 구조를 담당
 * - 모든 페이지에서 공통으로 사용되는 내비게이션 바, 사이드바 레이아웃
 * - React Router의 Outlet을 통해 하위 페이지들을 렌더링
 */

const AppLayout = () => {
    // React Router의 현재 위치 정보를 가져옴
    const location = useLocation();
    // 커스텀 훅을 통해 현재 사용자 정보를 가져옴
    const { currentUser } = useChatState();

    // workspace 페이지의 사이드바 상태 관리
    // 이후 다른 페이지들의 각각 사이드바 상태 관리 확장... 예정
    const [workspaceSidebarOpen, setWorkspaceSidebarOpen] = useState(false);
    // workspace 사이드바 토글 함수
    const toggleWorkspaceSidebar = () => setWorkspaceSidebarOpen(!workspaceSidebarOpen);

    // 현재 경로에 따른 페이지 결정
    const getCurrentPage = () => {
        // URL을 '/'로 분할해서 첫 번째 경로 추출
        const path = location.pathname.split('/')[1];
        // 경로가 없으면 'main'을 기본값으로 사용
        return path || 'main';
    };

    // workspace 페이지인지 확인하고 하는 건데 일단 보류
    const isWorkspacePage = location.pathname.startsWith('/workspace');

    return (
        <div className="h-screen flex bg-gray-50">
            {/* 고정 사이드바 */}
            <FixedSidebar currentUser={currentUser} />

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex flex-col">
                <Navigation
                    toggleSidebar={isWorkspacePage ? toggleWorkspaceSidebar : null}
                    currentUser={currentUser}
                    currentPage={getCurrentPage()}
                />

                {/* 페이지 콘텐츠 - React Router Outlet */}
                <div className="flex-1 flex">
                    <Outlet context={{
                        workspaceSidebarOpen,
                        setWorkspaceSidebarOpen,
                        toggleWorkspaceSidebar
                    }} />
                </div>
            </div>
        </div>
    );
};

export default AppLayout;