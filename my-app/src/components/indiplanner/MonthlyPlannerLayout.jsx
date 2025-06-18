import React, { useState } from "react";
import PlannerHeader from "./PlannerHeader";
import CalendarGrid from "./CalendarGrid";

/**
 * MonthlyPlanner/index.jsx
 * - 전체 레이아웃 및 상태관리
 */
const MonthlyPlannerLayout = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState("monthly"); // 'monthly' or 'weekly'
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);

    //따로 파일로 뺄지
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "팀 회의",
            date: "2024-12-15",
            time: "14:00",
            location: "회의실 A",
            category: "work",
            color: "bg-blue-500",
        },
        {
            id: 2,
            title: "운동",
            date: "2024-12-16",
            time: "19:00",
            location: "헬스장",
            category: "personal",
            color: "bg-green-500",
        },
        {
            id: 3,
            title: "생일파티",
            date: "2024-12-20",
            time: "18:00",
            location: "집",
            category: "social",
            color: "bg-purple-500",
        },
    ]);
    const [todos, setTodos] = useState([
        { id: 1, text: "기획서 작성", completed: false, category: "work" },
        { id: 2, text: "장보기", completed: true, category: "personal" },
        { id: 3, text: "친구와 약속 잡기", completed: false, category: "social" },
    ]);

    // 날짜 목록 생성

    {
        /*
        먼슬리 -> 위클리로 바꾸면서 해야될? 일

        1. 년도 적는 거 빼기


        */
    }
    const generateCalendarDates = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const offset = (firstDay.getDay() + 6) % 7;
        const start = new Date(firstDay);
        start.setDate(firstDay.getDate() - offset);

        const dates = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dates.push(d);
        }
        return dates;
    };
    const calendarDates = generateCalendarDates();

    // 할일 토글 함수
    const toggleTodo = (id) => {
        setTodos((ts) =>
            ts.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 메인 영역 */}
            <div className="flex-1 flex flex-col">
                <PlannerHeader
                    currentDate={currentDate}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    onPrevMonth={() =>
                        setCurrentDate(
                            (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
                        )
                    }
                    onNextMonth={() =>
                        setCurrentDate(
                            (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
                        )
                    }
                    onToday={() => setCurrentDate(new Date())}
                    onAddEvent={() => {}}
                />
                <CalendarBoard
                    dates={calendarDates}
                    events={events}
                    currentDate={currentDate}
                    onSelectEvent={setSelectedEvent}
                    viewMode={viewMode}
                />
            </div>

            {/* 사이드바 + 투두/오늘 일정 */}
            <PlannerSideBar
                todos={todos}
                onToggleTodo={toggleTodo}
                events={events}
                today={new Date()}
            />

            {/* 일정 상세 모달 */}
            {selectedEvent && (
                <PlannerSideBar.EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    );
};

export default MonthlyPlannerLayout;