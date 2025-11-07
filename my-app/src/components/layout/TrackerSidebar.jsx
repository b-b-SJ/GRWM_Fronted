//components/layout/TrackerSidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    X,
    CheckSquare,
    BookOpen,
    Calendar,
    BarChart3,
    RotateCcw,
    MessageCircle,
    Hash,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

/**
 * 트래커 페이지의 사이드바 컴포넌트
 * To-do와 회고일기를 전환할 수 있는 트래커 사이드바
 */
const TrackerSidebar = ({
                            sidebarOpen,
                            toggleSidebar,
                            trackerMode,
                            setTrackerMode,
                            currentView,
                            setCurrentView
                        }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [calendarDate, setCalendarDate] = useState(new Date());

    const trackerModes = [
        { id: 'todo', label: 'To-do', icon: CheckSquare },
        { id: 'diary', label: '회고일기', icon: BookOpen }
    ];

    // To-do 모드의 메뉴 항목들
    const todoMenuItems = [
        // { id: 'statistics', label: '통계', icon: BarChart3, view: 'todo-statistics' },
        { id: 'routine', label: '반복 루틴 관리', icon: RotateCcw, view: 'todo-routine' }
    ];

    // 회고일기 모드의 메뉴 항목들
    const diaryMenuItems = [
        { id: 'message', label: '내일의 나에게', icon: MessageCircle, view: 'diary-message' },
        // { id: 'hashtag', label: '해시태그', icon: Hash, view: 'diary-hashtag' }
    ];

    // URL 기반 모드 변경 함수
    const handleModeChange = (mode) => {
        const newParams = new URLSearchParams(searchParams);

        if (mode === 'todo') {
            newParams.set('mode', 'todo');
        } else {
            // diary가 기본값이므로 mode 파라미터 제거
            newParams.delete('mode');
        }

        // 기존의 다른 쿼리 파라미터들은 유지
        const newUrl = `/tracker${newParams.toString() ? `?${newParams.toString()}` : ''}`;
        navigate(newUrl);

        // 상태 업데이트
        setTrackerMode(mode);

        // 모드 변경 시 기본 뷰로 설정
        if (mode === 'todo') {
            setCurrentView('todo-calendar');
        } else {
            setCurrentView('diary-calendar');
        }
    };

    const getCurrentMenuItems = () => {
        return trackerMode === 'todo' ? todoMenuItems : diaryMenuItems;
    };

    // 캘린더 관련 함수들
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const goToPreviousMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        // 로컬 시간대 기준으로 날짜 문자열 생성
        const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        const newParams = new URLSearchParams(searchParams);
        newParams.set('date', dateString);

        const newUrl = `/tracker?${newParams.toString()}`;
        navigate(newUrl);

        setCurrentView(trackerMode === 'todo' ? 'todo-calendar' : 'diary-calendar');
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(calendarDate);
        const firstDay = getFirstDayOfMonth(calendarDate);
        const today = new Date();
        const selectedDate = searchParams.get('date');
        const days = [];
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        // 빈 칸 추가 (월의 시작일 전)
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8"></div>);
        }

        // 날짜 추가
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
            const isToday = currentDate.toDateString() === today.toDateString();

            // 로컬 시간대 기준으로 YYYY-MM-DD 문자열 생성
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const currentDateString = `${year}-${month}-${dayStr}`;

            // URL에서 가져온 날짜와 로컬 날짜 문자열 비교
            const isSelected = selectedDate && currentDateString === selectedDate;

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 text-sm rounded-lg flex items-center justify-center transition-colors relative
            ${isToday
                        ? 'bg-blue-500 text-white font-bold'
                        : isSelected
                            ? trackerMode === 'todo'
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'bg-green-100 text-green-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                    }
          `}
                >
                    {day}
                </button>
            );
        }

        return (
            <div className="bg-white rounded-lg border p-3">
                {/* 캘린더 헤더 */}
                <div className="flex items-center justify-between mb-3">
                    <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft size={16} />
                    </button>
                    <h4 className="font-medium text-gray-800 text-sm">
                        {calendarDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                    </h4>
                    <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="h-6 flex items-center justify-center text-xs text-gray-500 font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className={`
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-10
      w-80 bg-white border-r shadow-lg lg:shadow-none
      transition-transform duration-300 ease-in-out
      flex flex-col
    `}>
            {/* 사이드바의 헤더 */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">트래커</h2>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={18}/>
                    </button>
                </div>

                {/* 트래커 모드 선택 */}
                <div className="mb-6">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {trackerModes.map((mode) => {
                            const IconComponent = mode.icon;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => handleModeChange(mode.id)}
                                    className={`
                    flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all
                    ${trackerMode === mode.id
                                        ? 'bg-white text-blue-600 shadow-sm font-medium'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }
                  `}
                                >
                                    <IconComponent size={16}/>
                                    <span className="text-sm">{mode.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 메뉴 항목들 */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {/* 캘린더 섹션 */}
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 px-3 mb-3">
                            {trackerMode === 'todo' ? 'To-do 검색' : '회고 검색'}
                        </h3>
                        {renderCalendar()}
                    </div>

                    {/* 기능 메뉴 */}
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 px-3 mb-2">
                            {trackerMode === 'todo' ? 'To-do 관리' : '회고일기 관리'}
                        </h3>

                        {getCurrentMenuItems().map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.view)}
                                    className={`
                    w-full p-3 rounded-lg cursor-pointer transition-colors mb-1 flex items-center space-x-3
                    ${currentView === item.view
                                        ? trackerMode === 'todo'
                                            ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                                            : 'bg-green-50 border-l-4 border-green-600 text-green-700'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }
                  `}
                                >
                                    <IconComponent size={18} className={
                                        currentView === item.view
                                            ? trackerMode === 'todo' ? 'text-blue-600' : 'text-green-600'
                                            : 'text-gray-500'
                                    }/>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackerSidebar;