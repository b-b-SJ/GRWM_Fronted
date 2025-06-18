import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import PlannerHeader from "../indiplanner/PlannerHeader";
import CalendarGrid from "../indiplanner/CalendarGrid";
import PlannerSidebar from "../indiplanner/PlannerSidebar";
import { Calendar, CheckSquare } from "lucide-react";

const PlannerPage = () => {
  // 기본 상태들
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("monthly"); // 'monthly' or 'weekly'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 부모 컴포넌트에서 사이드바 상태 가져오기
  // 수정: useOutletContext가 undefined일 경우를 대비한 기본값 설정
  const outletContext = useOutletContext();
  const plannerSidebarOpen = outletContext?.plannerSidebarOpen ?? true;
  const togglePlannerSidebar = outletContext?.togglePlannerSidebar ?? (() => {});

  // 샘플 이벤트 데이터
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "팀 회의",
      date: "2025-06-17",
      time: "14:00",
      location: "A동 카페",
      category: "work",
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "졸프 발표",
      date: "2025-06-18",
      time: "10:30",
      location: "학교",
      category: "work",
      color: "bg-blue-500",
    },
    {
      id: 4,
      title: "운동",
      date: "2025-06-18",
      time: "19:00",
      location: "헬스장",
      category: "personal",
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "갱머니 생일",
      date: "2025-06-15",
      time: "18:00",
      location: "집",
      category: "social",
      color: "bg-purple-500",
    },
    {
      id: 5,
      title: "엄마랑 점심",
      date: "2025-06-30",
      time: "12:00",
      location: "명동",
      category: "personal",
      color: "bg-green-500",
    },
  ]);

  // 샘플 할일 데이터
  const [todos, setTodos] = useState([
    { id: 1, text: "기획서 작성", completed: false, category: "work" },
    { id: 2, text: "장보기", completed: true, category: "personal" },
    { id: 3, text: "친구와 약속 잡기", completed: false, category: "social" },
  ]);

  // 날짜 목록 생성 함수
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
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 월 이동 함수들
  const handlePrevMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    // 일정 추가 기능 (나중에 구현)
    console.log("일정 추가");
  };

  // 수정: 빈날짜 나와도 일정 안뜨게
  const handleSelectEvent = (eventOrDate) => {
    // 이벤트 객체인지 확인 (id 속성이 있으면 이벤트)
    if (eventOrDate && typeof eventOrDate === "object" && eventOrDate.id) {
      setSelectedEvent(eventOrDate);
      console.log("이벤트 선택:", eventOrDate);
    } else if (eventOrDate instanceof Date) {
      // 날짜 클릭시에는 모달을 열지 않음
      console.log("날짜 클릭:", eventOrDate);
      // 필요하다면 여기에 날짜 클릭 시 동작 추가
    } else {
      // 빈 공간 클릭 시 아무것도 하지 않음
      console.log("빈 공간 클릭");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* 플래너 사이드바 */}
        <PlannerSidebar
          isCollapsed={!plannerSidebarOpen}
          onToggle={togglePlannerSidebar}
          todos={todos}
          onToggleTodo={toggleTodo}
          events={events}
          today={new Date()}
        />

        {/* 메인 플래너 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 플래너 헤더 */}
          <PlannerHeader
            currentDate={currentDate}
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            onAddEvent={handleAddEvent}
          />

          {/* 수정: CalendarGrid의 onSelectEvent prop 수정 */}
          <CalendarGrid
            dates={calendarDates}
            events={events}
            currentDate={currentDate}
            viewMode={viewMode}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>

      {/* 일정 상세 */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">일정 상세</h3>
            <div className="space-y-2">
              <p>
                <strong>제목:</strong> {selectedEvent.title}
              </p>
              {selectedEvent.time && (
                <p>
                  <strong>시간:</strong> {selectedEvent.time}
                </p>
              )}
              {selectedEvent.location && (
                <p>
                  <strong>장소:</strong> {selectedEvent.location}
                </p>
              )}
              {selectedEvent.category && (
                <p>
                  <strong>카테고리:</strong> {selectedEvent.category}
                </p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PlannerPage;
        </div>
    );
};

export default PlannerPage;
