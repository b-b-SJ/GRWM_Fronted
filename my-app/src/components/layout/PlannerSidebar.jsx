import React, { useState, useEffect, useCallback } from "react";
import TodoList from "../planner/TodoList";
import ScheduleListSidebar from "../planner/ScheduleListSidebar";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import MonthlyGrid from "../planner/MonthlyGrid";
import { useCalendar } from "../../hooks/useCalendar";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import ScheduleFormModal from "../planner/ScheduleFormModal";
import { usePlannerContext } from "../../hooks/PlannerContext";
import { useParams, useNavigate } from "react-router-dom";
import TodoSidebarWidget from "../../components/tracker/TodoSidebarWidget";
import useTodoApi from "../../hooks/useTodoApi";
import { useAuth } from "../../hooks/AuthContext";

const PlannerSidebar = ({ sidebarOpen }) => {
  const { currentDate, setCurrentDate, viewMode, plannerType } =
    usePlannerContext();

  const { plannerId } = useParams();
  const nowPlanner = Number(plannerId);
  const {
    todaySchedules,
    loading: scheduleLoading,
    fetchTodaySchedules,
    fetchMonthlySchedules,
  } = useCurrentPlanner(plannerType);

  // todo관련 훅
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const {
    loading: todoLoading,
    getTodos,
    updateTodo,
    completeTodo,
  } = useTodoApi(user, isAuthenticated, getAuthHeaders);
  const navigate = useNavigate();

  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [todoOpen, setTodoOpen] = useState(true);
  const [tempDate, setTempDate] = useState(currentDate);
  const [openAddModal, setOpenAddModal] = useState(false);

  // Todo state
  const [todayTodos, setTodayTodos] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, todo: null });
  const currentUserId = user?.userId;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const calendar = useCalendar();

  // 일정 관련
  useEffect(() => {
    if (!nowPlanner) return;
    console.log(`[${plannerType}] 일정 로딩 (URL plannerId: ${nowPlanner})`);
    fetchTodaySchedules(nowPlanner, year, month + 1, today.getDate());
  }, [plannerId, plannerType]);

  const handleScheduleCreated = async () => {
    console.log("일정 생성 성공! 새로고침");
    if (!nowPlanner) return;
    await fetchTodaySchedules(nowPlanner, year, month + 1, today.getDate());
    await fetchMonthlySchedules(nowPlanner, year, month + 1);
  };

  const handleScheduleDeleted = async () => {
    console.log("일정 삭제 성공! 새로고침");
    if (!nowPlanner) return;
    await fetchTodaySchedules(nowPlanner, year, month + 1, today.getDate());
  };

  // Todo 관련 함수들
  const fetchTodayTodos = useCallback(async () => {
    if (!currentUserId) {
      setTodayTodos([]);
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const fetchedTodos = await getTodos(currentUserId, { date: today });

      if (fetchedTodos) {
        const normalizedTodos = Array.isArray(fetchedTodos)
          ? fetchedTodos
              .map((todo) => ({
                ...todo,
                id: todo.todoId,
                date: new Date(todo.date).toISOString().split("T")[0],
              }))
              .filter((todo) => todo.date === today)
              .filter((todo) => !todo.postponed)
          : [];
        setTodayTodos(normalizedTodos);
      }
    } catch (error) {
      console.error("오늘의 투두 로드 실패:", error);
    }
  }, [currentUserId, getTodos]);

  const handleToggleComplete = async (todoId) => {
    if (!currentUserId) return;

    try {
      const todo = todayTodos.find((t) => t.id === todoId);
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

  //  Todo 불러오기
  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      fetchTodayTodos();
    }
  }, [isAuthenticated, currentUserId, fetchTodayTodos]);

  // 캘린더 날짜 계산
  const sideDate = new Date(tempDate);
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
  const setMonday = (firstDayOfMonth.getDay() + 6) % 7;
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(1 - setMonday);
  const endDay = new Date(lastDayOfMonth);
  const remaining = 6 - ((lastDayOfMonth.getDay() + 6) % 7);
  endDay.setDate(endDay.getDate() + remaining);

  const goPrev = () => {
    sideDate.setMonth(sideDate.getMonth() - 1);
    setTempDate(new Date(sideDate));
  };

  const goNext = () => {
    sideDate.setMonth(sideDate.getMonth() + 1);
    setTempDate(new Date(sideDate));
  };

  const sideWeeks = calendar.groupDatesByWeek(startDay, endDay);

  useEffect(() => {
    setTempDate(currentDate);
  }, [currentDate]);

  return (
    <div
      className={`
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
      lg:translate-x-0 
      fixed lg:static inset-y-0 left-0 z-10
      w-80 bg-white border-r shadow-lg lg:shadow-none
      transition-transform duration-300 ease-in-out
      flex flex-col
    `}
    >
      <div className="w-80 bg-white border-r flex flex-col h-auto">
        <div>
          {(viewMode === "daily" || viewMode === "weekly") && (
            <div className="p-4 shadow-sm shadow-gray-200">
              <div className="flex justify-center mb-2">
                <button onClick={goPrev}>
                  <ChevronLeft className="hover:bg-gray-200 rounded-md" />
                </button>
                <h1 className="mx-4 text-xl font-semibold">
                  {sideDate.getFullYear()}. {sideDate.getMonth() + 1}
                </h1>
                <button onClick={goNext}>
                  <ChevronRight className="hover:bg-gray-200 rounded-md" />
                </button>
              </div>
              <MonthlyGrid
                weeks={sideWeeks}
                month={tempDate.getMonth()}
                totalDateStyle="p-2 hover:rounded-full text-center hover:bg-gray-100"
                currentMonthStyle="text-gray-800"
                ncMonthStyle="text-gray-300"
                onDateClick={(day) => setCurrentDate(day)}
                showSchedules={false}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col flex-none text-left">
          {/* 일정 섹션  */}
          <button
            onClick={() => setScheduleOpen(!scheduleOpen)}
            className={`py-2.5 p-2 text-md text-left font-bold flex shadow-sm shadow-gray-200 ${
              scheduleOpen ? "" : "hover:bg-gray-200"
            }`}
          >
            오늘의 일정
            <ChevronDown
              size={20}
              className={`mt-1 ml-auto transition-transform ${
                scheduleOpen ? "" : "scale-y-[-1]"
              }`}
            />
          </button>

          {scheduleOpen && (
            <>
              <ScheduleListSidebar
                className="max-h-60 min-h-60"
                todaySc={todaySchedules}
                isLoading={scheduleLoading}
                onScheduleDeleted={handleScheduleDeleted}
              />
              <button
                className="text-sm text-left p-2 hover:bg-gray-100"
                onClick={() => setOpenAddModal(true)}
              >
                + 일정 추가하기
              </button>
            </>
          )}

          {/*  Todo 섹션 (수지님 코드 반영!) */}
          <button
            onClick={() => setTodoOpen(!todoOpen)}
            className={`py-2.5 p-2 text-md text-left font-bold flex shadow-sm shadow-gray-200 ${
              todoOpen ? "" : "hover:bg-gray-200"
            }`}
          >
            오늘의 todo
            <ChevronDown
              size={20}
              className={`mt-1 ml-auto transition-transform ${
                todoOpen ? "" : "scale-y-[-1]"
              }`}
            />
          </button>

          {todoOpen && (
            <div className="max-h-60 min-h-60 overflow-y-auto p-2">
              {isAuthenticated ? (
                <TodoSidebarWidget
                  todos={todayTodos}
                  onToggleComplete={handleToggleComplete}
                  onOpenAddModal={() =>
                    setModalState({ isOpen: true, todo: null })
                  }
                  onNavigateToTracker={() => navigate("/tracker?mode=todo")}
                  loading={todoLoading}
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

      {/* 일정 생성 모달 (내 코드) */}
      <ScheduleFormModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        mode="create"
        onSuccess={handleScheduleCreated}
      />
    </div>
  );
};

export default PlannerSidebar;
