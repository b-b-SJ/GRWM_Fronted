import React, {useState, useEffect, useCallback} from "react";
import TodoList from "../planner/TodoList";
import ScheduleListSidebar from "../planner/ScheduleListSidebar";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MonthlyGrid from "../planner/MonthlyGrid";
import { useCalendar } from "../../hooks/useCalendar";
import { useScheduleFilter } from "../../hooks/useScheduleFilter";
import TodoSidebarWidget from "../../components/tracker/TodoSidebarWidget";
import {useNavigate} from "react-router-dom";
import useTodoApi from "../../hooks/useTodoApi";
import { useAuth } from "../../hooks/AuthContext";

const PlannerSidebar = ({
  sidebarClassName,
  viewMode,
  //year = { year },
  // month = { month },
  currentDate,
  setCurrentDate,
  weeks,
  setViewMode,
  weekNames,
  nowPlanner,
  openScModal,
  setOpenScModal,
  selectedSc,
  setSelectedSc,
}) => {
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [todoOpen, setTodoOpen] = useState(true);
  const [tempDate, setTempDate] = useState(currentDate);
  //console.log("plannerSidebar", viewMode);
  //const prevMonth = new Date(tempDate);
  //const nextMonth = new Date(tempDate);
  const sideDate = new Date(tempDate);
  const calendar = useCalendar();
  const scFilter = useScheduleFilter({ nowPlanner, currentDate });

  // to-do modal 관련 추가
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const { loading, getTodos, createTodo, updateTodo, deleteTodo, completeTodo } =
      useTodoApi(user, isAuthenticated, getAuthHeaders);
  const navigate = useNavigate();

  const [todayTodos, setTodayTodos] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, todo: null });

  const currentUserId = user?.userId;
  // to-do modal 관련 추가 끝

  //useCalendar에서 직접 그냥 가져옴; - 메인 캘린더랑 분리를 위해서
  const firstDayOfMonth = new Date(
    tempDate.getFullYear(),
    tempDate.getMonth(),
    1
  );

  const lastDayOfMonth = new Date(
    tempDate.getFullYear(),
    tempDate.getMonth() + 1,
    0
  );

  //월요일기준정렬
  const setMonday = (firstDayOfMonth.getDay() + 6) % 7;
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(1 - setMonday); //startDay 변경

  const endDay = new Date(lastDayOfMonth);
  const remaining = 6 - ((lastDayOfMonth.getDay() + 6) % 7);
  endDay.setDate(endDay.getDate() + remaining);

  //날짜 바꾸미
  const goPrev = () => {
    sideDate.setMonth(sideDate.getMonth() - 1);
    setTempDate(sideDate);
  };
  const goNext = () => {
    sideDate.setMonth(sideDate.getMonth() + 1);
    setTempDate(sideDate);
  };

  const sideWeeks = calendar.groupDatesByWeek(startDay, endDay);

  // To-do 데이터 가져오기
  const fetchTodayTodos = useCallback(async () => {
    if (!currentUserId) {
      setTodayTodos([]);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const fetchedTodos = await getTodos(currentUserId, { date: today });

      if (fetchedTodos) {
        const normalizedTodos = Array.isArray(fetchedTodos)
            ? fetchedTodos.map(todo => ({
              ...todo,
              id: todo.todoId,
              date: new Date(todo.date).toISOString().split('T')[0]
            }))
            : [];
        setTodayTodos(normalizedTodos);
      }
    } catch (error) {
      console.error('오늘의 투두 로드 실패:', error);
    }
  }, [currentUserId, getTodos]);

  // To-do 완료/미완료 토글
  const handleToggleComplete = async (todoId) => {
    if (!currentUserId) return;

    try {
      const todo = todayTodos.find(t => t.id === todoId);
      if (!todo) return;

      if (!todo.completed) {
        await completeTodo(currentUserId, todoId);
      } else {
        await updateTodo(currentUserId, todoId, {
          title: todo.title,
          description: todo.description,
          date: todo.date,
          completed: false,
          postponed: todo.postponed,
        });
      }

      await fetchTodayTodos();
    } catch (error) {
      console.error("Todo 완료 처리 실패:", error);
    }
  };

  //메인 플래너 날짜가 바뀌면 따라감
  useEffect(() => {
    setTempDate(currentDate);
  }, [currentDate]);

  // to-do 불러오기
  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      fetchTodayTodos();
    }
  }, [isAuthenticated, currentUserId, fetchTodayTodos]);

  return (
    <div className={`${sidebarClassName}`}>
      <div className="w-80 bg-white border-r flex flex-col">
        <div>
          {(viewMode === "daily" || viewMode === "weekly") && (
            <div className="p-4 shadow-sm shadow-gray-200">
              {/**왔다갔다만 하고 선택전까지는 날짜 안바뀜 */}
              <div className="flex justify-center mb-2">
                {/**이 위에서 정렬관리*/}
                <button onClick={() => goPrev()}>
                  <ChevronLeft className="hover:bg-gray-200 rounded-md" />
                </button>
                <h1 className="mx-4 text-xl font-semibold">
                  {sideDate.getFullYear()}. {sideDate.getMonth() + 1}
                </h1>
                <button onClick={() => goNext()}>
                  <ChevronRight className="hover:bg-gray-200 rounded-md" />
                </button>
              </div>
              <MonthlyGrid
                weeks={sideWeeks}
                month={tempDate.getMonth()}
                //viewMode={viewMode}
                setViewMode={setViewMode}
                setCurrentDate={setCurrentDate}
                weekNames={weekNames}
                totalDateStyle={
                  "p-2 hover:rounded-full focus:outline-rose-200 text-center hover:bg-gray-100"
                }
                currentMonthStyle={"text-gray-800"}
                ncMonthStyle={
                  "text-gray-300"
                  //지금 월아닐때
                }
                onDateClick={(day) => {
                  setCurrentDate(day);
                  // setViewMode("daily");
                }}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col flex-none text-left">
          <button
            onClick={() => setScheduleOpen(!scheduleOpen)}
            className={` py-2.5 p-2 text-md text-left font-bold flex  shadow-sm shadow-gray-200
    ${scheduleOpen ? "" : "hover:bg-gray-200"}`}
          >
            오늘의 일정
            <ChevronDown
              size={20}
              className={`mt-1 ml-auto transition-transform ${
                scheduleOpen ? "" : "scale-y-[-1]"
              }`}
            />
          </button>
          {scheduleOpen === true && (
            <ScheduleListSidebar
              filtering={scFilter}
              //scDateFiltered={scTodayFiltered}
              className="max-h-60 min-h-60"
              openScModal={openScModal}
              setOpenScModal={setOpenScModal}
              selectedSc={selectedSc}
              setSelectedSc={setSelectedSc}
              currentDate={currentDate}
            />
          )}

          <button
            onClick={() => setTodoOpen(!todoOpen)}
            className={`py-2.5 p-2 text-md text-left font-bold flex  shadow-sm shadow-gray-200
    ${todoOpen ? "" : "hover:bg-gray-200"}`}
          >
            오늘의 todo
            <ChevronDown
              size={20}
              className={`mt-1 ml-auto transition-transform ${
                todoOpen ? "" : "scale-y-[-1]"
              }`}
            />
          </button>
          {/* 기존 TodoList 대신 todowidget으로 교체 */}
          {todoOpen && (
              <div className="max-h-60 min-h-60 overflow-y-auto p-2">
                {isAuthenticated ? (
                    <TodoSidebarWidget
                        todos={todayTodos}
                        onToggleComplete={handleToggleComplete}
                        onOpenAddModal={() => setModalState({ isOpen: true, todo: null })}
                        onNavigateToTracker={() => navigate('/tracker?mode=todo')}
                        loading={loading}
                    />
                ) : (
                    <div className="text-center py-6 text-sm text-gray-500">
                      로그인 후 사용 가능합니다
                    </div>
                )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
export default PlannerSidebar;
