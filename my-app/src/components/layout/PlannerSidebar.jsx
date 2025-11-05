import React, { useState, useEffect } from "react";
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
import { useTeamPlanner } from "../../hooks/TeamPlannerProvider";
import ScheduleFormModal from "../planner/ScheduleFormModal";

import { usePlannerContext } from "../../hooks/PlannerContext";

const PlannerSidebar = ({
  nowPlanner,
  sidebarClassName,
  plannerType = "shared", //<- 플래너 타입 추후 context로 추가
}) => {
  const {
    currentDate,
    setCurrentDate,
    viewMode,
    openScModal,
    setOpenScModal,
    selectedSc,
    setSelectedSc,
  } = usePlannerContext();

  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [todoOpen, setTodoOpen] = useState(true);
  const [tempDate, setTempDate] = useState(currentDate);
  const [todaySchedules, setTodaySchedules] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const { fetchMonthlySchedules, fetchDailySchedules, fetchWeeklySchedules } =
    useTeamPlanner();

  // 오늘 일정을 불러오는 함수 분리
  const loadTodaySchedules = async () => {
    if (!nowPlanner) return;

    try {
      console.log("오늘 일정 불러오기 시작...");
      const schedules = await fetchDailySchedules(
        nowPlanner,
        year,
        month + 1,
        today.getDate()
      );

      console.log("불러온 오늘 일정:", schedules);
      setTodaySchedules(schedules);
    } catch (error) {
      console.error("오늘 일정 불러오기 실패:", error);
    }
  };

  // ✅ 초기 로드
  useEffect(() => {
    loadTodaySchedules();
  }, [nowPlanner]); // nowPlanner가 변경될 때만 실행

  // ✅ 일정 생성 성공 후 호출되는 함수
  const handleScheduleCreated = async () => {
    console.log("일정 생성 성공! 목록 새로고침 시작");

    if (!nowPlanner) {
      console.error("nowPlanner가 없습니다");
      return;
    }

    try {
      // 1. 오늘 일정 다시 불러오기
      await loadTodaySchedules();

      // 2. 월간/주간 일정도 필요하면 갱신
      await fetchMonthlySchedules(nowPlanner, year, month + 1);

      console.log("모든 일정 새로고침 완료!");
    } catch (error) {
      console.error("일정 새로고침 실패:", error);
    }
  };

  // ✅ 일정 삭제 성공 후 호출되는 함수 추가
  const handleScheduleDeleted = async (scheduleId) => {
    console.log(`일정 ${scheduleId} 삭제 성공! 목록 새로고침`);
    await loadTodaySchedules();
  };

  const calendar = useCalendar();
  const sideDate = new Date(tempDate);

  // ... 나머지 코드 (날짜 계산 로직 등)

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
    setTempDate(sideDate);
  };

  const goNext = () => {
    sideDate.setMonth(sideDate.getMonth() + 1);
    setTempDate(sideDate);
  };

  const sideWeeks = calendar.groupDatesByWeek(startDay, endDay);
  useEffect(() => {
    setTempDate(currentDate);
  }, [currentDate]);

  return (
    <div className={`${sidebarClassName}`}>
      <div className="w-80 bg-white border-r flex flex-col h-auto">
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
                }}
              />
            </div>
          )}
        </div>
        {/* 일정 + 투두 */}
        <div className="flex flex-col flex-none text-left">
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

          {scheduleOpen === true && (
            <>
              {/* ✅ key prop 추가로 강제 리렌더링 */}
              <ScheduleListSidebar
                key={todaySchedules?.length || 0} // 일정 개수가 바뀌면 리렌더링
                className="max-h-60 min-h-60"
                todaySc={todaySchedules}
                onScheduleDeleted={handleScheduleDeleted} // ✅ 삭제 콜백 전달
                nowPlanner={nowPlanner} // ✅ nowPlanner 전달
              />
              <button
                className="text-sm text-left p-2 hover:bg-gray-100"
                onClick={() => setOpenAddModal(true)}
              >
                + 일정 추가하기
              </button>
            </>
          )}

          {/* Todo 부분 */}
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

          <div>
            {todoOpen === true && (
              <>
                <TodoList className="max-h-60 min-h-60" />
                <button className="text-sm text-left p-2 hover:bg-gray-100">
                  + 할일 추가하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 일정 생성 모달 */}
      <ScheduleFormModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        mode="create"
        plannerType={plannerType}
        selectedDate={selectedDateForAdd}
        onSuccess={handleScheduleCreated} // ✅ 생성 성공 시 새로고침
      />
    </div>
  );
};

export default PlannerSidebar;
