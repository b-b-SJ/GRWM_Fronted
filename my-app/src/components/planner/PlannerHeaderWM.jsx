import React, { useState } from "react";

import WeeklyPlanner from "./WeeklyPlanner";
//<UserRoundPlus />; //유저 아이콘임
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import DailyPlanner from "./DailyPlanner";
//import { useScheduleGrouping } from "../../hooks/useScheduleFilter";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTeamPlanner } from "../../hooks/TeamPlannerProvider";
import { usePlannerContext } from "../../hooks/PlannerContext";
import MonthlyGrid from "./MonthlyGrid";

const PlannerHeaderWM = ({}) => {
  const { planners } = useTeamPlanner();
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
  const findNowPlannerInfo = () => {
    return planners.find((planner) => planner.plannerId === nowPlanner);
  };

  const nowPlannerInfo = findNowPlannerInfo();
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로에서 shared인지 personal인지 판단
  //const isShared = location.pathname.includes("/shared");
  //const plannerType = isShared ? "shared" : "personal";

  const handleGoToList = () => {
    navigate(`/planner/list/${plannerType}`);
  };

  const [viewDate, setViewDate] = useState(new Date());
  //const scFilter = useScheduleGrouping({ nowPlanner, currentDate });

  const goPrev = () => setCurrentDate((prev) => STEP[viewMode].prev(prev));
  const goNext = () => setCurrentDate((prev) => STEP[viewMode].next(prev));

  const [selectCalendar, setSelectCalendar] = useState(false);
  return (
    //토글 버튼 - monthly, weekly 전환
    <div className="pt-4">
      <div className="mt-2 ml-24 flex items-start p-3 outline outline-gray-800 font-bold rounded-r-3xl rounded-tl-3xl w-fit pl-5 pr-5">
        {nowPlannerInfo?.title}
      </div>
      <div className="flex items-center relative">
        <div className="flex items-center gap-7 px-4 outline-gray-700">
          {/* 플래너 전환
           */}
          <div className="relative group inline-block">
            <button
              onClick={handleGoToList}
              className={`w-20 h-20 rounded-full flex items-center justify-center bg-cover bg-center
    ${
      !nowPlannerInfo?.profileImage &&
      (plannerType === "shared"
        ? "bg-blue-100" // 공유 플래너 배경색
        : "bg-gray-100") // 개인 플래너 배경색
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
                    plannerType === "shared"
                      ? "text-blue-500" // 공유 플래너 아이콘 색상
                      : "text-gray-500" // 개인 플래너 아이콘 색상
                  }`}
                />
              )}
            </button>
            <div
              className="absolute left-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg hidden group-hover:block"

              //달력 바꾸는 hover 창 -> 영역 좀 벗어나도 작동해야됨+클릭하면 hover일 때 보이는 거 고정으로 보여야됨
              //setNowPlanner 써서 캘린더 변경, plannerList map으로 보여줘야함
            >
              달력 바꾸미
            </div>
          </div>
          <div className="flex p-1.5 w-fit rounded-2xl text-sm font-bold text-gray-500 outline outline-2 mt-6">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-xl
    ${viewMode === "monthly" ? "bg-blue-400 text-white" : "bg-white"}`}
            >
              monthly
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 rounded-xl
    ${viewMode === "weekly" ? "bg-blue-400 text-white" : "bg-white"}`}
            >
              weekly
            </button>
          </div>
        </div>

        {/* 얘는 그거요 그 뭐냐... 날짜 사이 왔다갔다 하는 거
      
      */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-md font-bold text-gray-500">
            {viewMode === "weekly" //년도
              ? currentMonthName
              : year}
          </span>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => goPrev()} className="  px-3 py-1">
              <ChevronLeft className="hover:bg-gray-100 rounded-md" />
            </button>

            <span className="text-5xl font-bold min-w-100">
              {viewMode === "weekly" ? ( //얘도 useCalendar에서 만든 것처럼 맵핑 방식으로 다시 짜야됨
                currentWeekNum
              ) : (
                <div>
                  {viewMode === "daily"
                    ? currentMonthName + " " + currentDate.getDate()
                    : currentMonthName}
                </div>
              )}
            </span>
            <button onClick={() => goNext()} className=" px-3 py-1">
              <ChevronRight className="hover:bg-gray-100 rounded-md" />
            </button>
          </div>
        </div>
      </div>
      {/*이건 플래너 사이 전환하는 거 */}

      <div>
        {/*화면 전환 -> 밑에 있어야됨요*/}
        {viewMode === "monthly" && (
          <div className="mt-4 mx-8">
            <MonthlyGrid
              totalDateStyle={`
    relative p-4 border border-gray-100 min-h-[120px] 
    hover:bg-gray-100
    bg-white shadow-sm
  `}
              onDateClick={(day) => {
                setViewMode("daily");
                setCurrentDate(day);
              }}
              currentMonthStyle={`text-gray-900 bg-white`}
              ncMonthStyle={`
    text-gray-400 bg-gray-50 
    hover:bg-gray-100 
    opacity-70
  `}

              //  previewMap={scFilter.groupedDate} 일정 관련 << 백에서 불러오면 됨
            />
          </div>
        )}
        {viewMode === "weekly" && (
          <WeeklyPlanner
            //    scFilter={scFilter}
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
