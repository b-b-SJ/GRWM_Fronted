import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Calendar, BarChart3, Users, MessageSquare, ChevronDown } from 'lucide-react';

/**
 * Navigation 컴포넌트
 * - 모든 페이지에서 공통으로 사용되는 고정된 내비게이션 바 레이아웃
 * - 플래너, 트래커, 협업공간, 커뮤니티로 이동
 */
const Navigation = ({ toggleSidebar, currentUser, currentPage }) => {
    const location = useLocation();  // 현재 URL 경로 정보
    const navigate = useNavigate();  // 프로그래밍 방식 페이지 이동
    const [openDropdown, setOpenDropdown] = useState(null); // 열린 드롭다운 메뉴 인덱스
    const dropdownRefs = useRef({}); // 드롭다운 DOM 요소 참조를 위한 ref 객체

    // 메뉴 - 서브메뉴 관리
    const navItems = [
        {
            icon: Calendar,
            label: '플래너',
            path: '/planner',
            subMenus: [
                { label: '개인 플래너', path: '/planner/personal' },
                { label: '공유 플래너', path: '/planner/shared' }
            ]
        },
        {
            icon: BarChart3,
            label: '트래커',
            path: '/tracker',
            subMenus: [
                { label: '회고일기', path: '/tracker/journal' },
                { label: 'TODO 리스트', path: '/tracker/todo' }
            ]
        },
        {
            icon: Users,
            label: '협업공간',
            path: '/workspace',
            subMenus: [
                { label: '채팅방', path: '/workspace' },
                { label: '스터디룸', path: '/workspace/study' }
            ]
        },
        {
            icon: MessageSquare,
            label: '커뮤니티',
            path: '/community',
            subMenus: []
        }
    ];

    // workspace의 경우 페이지 구현이 되어 있으므로 이동 가능 (나머지 기능은 추후 수정)
    const isActivePath = (path) => {
        if (path === '/workspace') {
            return location.pathname.startsWith('/workspace');
        }
        return location.pathname === path;
    };

    // 서브메뉴 드롭다운 메뉴
    const handleDropdownToggle = (index, e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenDropdown(openDropdown === index ? null : index);
    };

    // 서브메뉴 클릭 시 이동
    const handleSubMenuClick = (path) => {
        if (path === '/workspace') {
            navigate('/workspace');
        } else {
            // 다른 서브메뉴는 아직 구현되지 않음을 알림
            alert('해당 기능은 준비 중입니다.');
        }
        setOpenDropdown(null);
    };

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown !== null) {
                const dropdownElement = dropdownRefs.current[openDropdown];
                if (dropdownElement && !dropdownElement.contains(event.target)) {
                    setOpenDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdown]);

    return (
        <nav className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {/* 사이드바 토글 버튼 */}
                {toggleSidebar && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                )}
                {/* 메인 로고 : 클릭 시 메인 페이지로 이동 */}
                <Link to="/main" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">G</span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800">GRWM</h1>
                </Link>
            </div>

            {/* 메뉴 배치 */}
            <div className="hidden md:flex items-center space-x-2">
                {navItems.map((item, index) => (
                    <div key={index} className="relative" ref={el => dropdownRefs.current[index] = el}>
                        <div className="flex items-center">
                            <Link
                                to={item.path}
                                className={`flex items-center space-x-2 transition-colors px-3 py-2 rounded-lg ${
                                    isActivePath(item.path)
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>

                            {/* 드롭다운 화살표 (서브메뉴가 있는 경우에만) */}
                            {item.subMenus.length > 0 && (
                                <button
                                    onClick={(e) => handleDropdownToggle(index, e)}
                                    className={`ml-1 p-1 rounded transition-colors ${
                                        isActivePath(item.path)
                                            ? 'text-blue-600 hover:bg-blue-100'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <ChevronDown
                                        size={16}
                                        className={`transform transition-transform ${
                                            openDropdown === index ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                            )}
                        </div>

                        {/* 드롭다운 메뉴 */}
                        {item.subMenus.length > 0 && openDropdown === index && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-40 z-50">
                                {item.subMenus.map((subMenu, subIndex) => (
                                    <button
                                        key={subIndex}
                                        onClick={() => handleSubMenuClick(subMenu.path)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    >
                                        {subMenu.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default Navigation;