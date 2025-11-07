import React, { useState } from "react";
import WeeklyPlanner from "./WeeklyPlanner";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import DailyPlanner from "./DailyPlanner";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import { usePlannerContext } from "../../hooks/PlannerContext";
import MonthlyGrid from "./MonthlyGrid";

const PlannerHeaderWM = () => {
  const {
    viewMode,
    setViewMode,
    STEP,
    currentDate,
    setCurrentDate,
    currentMonthName,
    currentWeekNum,
    year,
    nowPlanner,
    plannerType,
  } = usePlannerContext();

  const { planners } = useCurrentPlanner(plannerType);

  const findNowPlannerInfo = () => {
    return planners.find((planner) => planner.plannerId === nowPlanner);
  };

  const nowPlannerInfo = findNowPlannerInfo();
  const navigate = useNavigate();

  const handleGoToList = () => {
    navigate(`/planner/list/${plannerType}`);
  };

  const goPrev = () => setCurrentDate((prev) => STEP[viewMode].prev(prev));
  const goNext = () => setCurrentDate((prev) => STEP[viewMode].next(prev));

  const [selectCalendar, setSelectCalendar] = useState(false);

  return (
    <div className="pt-4">
      <div className="mt-2 ml-24 flex items-start p-3 outline outline-gray-800 font-bold rounded-r-3xl rounded-tl-3xl w-fit pl-5 pr-5">
        {nowPlannerInfo?.title}
      </div>

      <div className="flex items-center relative">
        <div className="flex items-center gap-7 px-4 outline-gray-700">
          {/* 플래너 전환 */}
          <div className="relative group inline-block">
            <button
              onClick={handleGoToList}
              className={`w-20 h-20 rounded-full flex items-center justify-center bg-cover bg-center
                ${
                  !nowPlannerInfo?.profileImage &&
                  (plannerType === "shared" ? "bg-blue-100" : "bg-gray-100")
                }`}
              style={
                nowPlannerInfo?.profileImage
                  ? { backgroundImage: `url(${nowPlannerInfo.profileImage})` }
                  : {}
              }
            >
              {!nowPlannerInfo?.profileImage && (
                <Users
                  className={`w-10 h-10 ${
                    plannerType === "shared" ? "text-blue-500" : "text-gray-500"
                  }`}
                />
              )}
            </button>
            <div className="absolute left-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg hidden group-hover:block">
              달력 바꾸미
            </div>
          </div>

          {/* Monthly/Weekly 토글 */}
          <div className="flex p-1.5 w-fit rounded-2xl text-sm font-bold text-gray-500 outline outline-2 mt-6">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-xl ${
                viewMode === "monthly" ? "bg-blue-400 text-white" : "bg-white"
              }`}
            >
              monthly
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 rounded-xl ${
                viewMode === "weekly" ? "bg-blue-400 text-white" : "bg-white"
              }`}
            >
              weekly
            </button>
          </div>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-md font-bold text-gray-500">
            {viewMode === "weekly" ? currentMonthName : year}
          </span>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => goPrev()} className="px-3 py-1">
              <ChevronLeft className="hover:bg-gray-100 rounded-md" />
            </button>

            <span className="text-5xl font-bold min-w-100">
              {viewMode === "weekly" ? (
                currentWeekNum
              ) : (
                <div>
                  {viewMode === "daily"
                    ? currentMonthName + " " + currentDate.getDate()
                    : currentMonthName}
                </div>
              )}
            </span>

            <button onClick={() => goNext()} className="px-3 py-1">
              <ChevronRight className="hover:bg-gray-100 rounded-md" />
            </button>
          </div>
        </div>
      </div>

      {/* 뷰 모드별 플래너 표시 */}
      <div>
        {viewMode === "monthly" && (
          <div className="mt-4 mx-8">
            <MonthlyGrid
              totalDateStyle={`
                relative p-4 border border-gray-100 min-h-[120px] 
                hover:bg-gray-100 bg-white shadow-sm
              `}
              onDateClick={(day) => {
                setViewMode("daily");
                setCurrentDate(day);
              }}
              currentMonthStyle={`text-gray-900 bg-white`}
              ncMonthStyle={`
                text-gray-400 bg-gray-50 
                hover:bg-gray-100 opacity-70
              `}
            />
          </div>
        )}

        {viewMode === "weekly" && (
          <WeeklyPlanner
            onDateClick={(day) => {
              setViewMode("daily");
              setCurrentDate(day);
            }}
          />
        )}

        {viewMode === "daily" && <DailyPlanner />}
      </div>
    </div>
  );
};

export default PlannerHeaderWM;
