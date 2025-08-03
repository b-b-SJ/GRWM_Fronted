import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import PlannerHeaderWM from "../planner/PlannerHeaderWM";
//import CalendarGrid from "../indiplanner/CalendarGrid";
import PlannerSidebar from "../planner/PlannerSidebar";
import { Calendar, CheckSquare, ChevronRight } from "lucide-react";
import TodoList from "../planner/TodoList";
import { useCalendar } from "../../hooks/useCalendar";

const PlannerPage = () => {
  // 기본 상태들

  const [viewMode, setViewMode] = useState("monthly"); // 'monthly' or 'weekly
  const [plannerSidebarOpen, setPlannerSidebarOpen] = useState(true);

  //날짜 설정

  const calendar = useCalendar();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 overflow-y-auto">
        <button
          onClick={() => setPlannerSidebarOpen(!plannerSidebarOpen)}
          className="text-md bg-orange-300"
        >
          <ChevronRight
            size={16}
            className={`transform transition-transform ${
              plannerSidebarOpen === true ? "scale-x-[-1]" : ""
            }`}
          />
        </button>
        {plannerSidebarOpen === true && (
          //<PlannerSidebar className="" viewMode={viewMode} >

          <PlannerSidebar
            className=""
            viewMode={viewMode}
            // year={calendar.year}
            //month={calendar.month}
            currentDate={calendar.currentDate}
            setCurrentDate={calendar.setCurrentDate}
            weeks={calendar.weeks}
            setViewMode={setViewMode}
            weekNames={calendar.weekNames}
          />
        )}

        {/* 메인 플래너 영역 */}
        <div className="flex-1 flex flex-col col-span-1">
          {/* 플래너 헤더 */}
          <PlannerHeaderWM
            viewMode={viewMode}
            setViewMode={setViewMode}
            currentDate={calendar.currentDate}
            setCurrentDate={calendar.setCurrentDate}
            STEP={calendar.STEP}
            weeks={calendar.weeks}
            currentMonthName={calendar.currentMonthName}
            currentWeekNum={calendar.currentWeekNum}
            year={calendar.year}
            findWeek={calendar.findWeek}
            weekFound={calendar.weekFound}
            //weekNames={calendar.weekNames}
            month={calendar.month}
            // searchQuery={searchQuery}
            // setSearchQuery={setSearchQuery}
            /// categoryFilter={categoryFilter}
            // setCategoryFilter={setCategoryFilter}
            //   onPrevMonth={handlePrevMonth}
            //  onNextMonth={handleNextMonth}
            //  onToday={handleToday}
            //  onAddEvent={handleAddEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
