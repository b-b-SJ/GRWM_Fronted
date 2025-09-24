import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import PlannerHeaderWM from "../planner/PlannerHeaderWM";
//import CalendarGrid from "../indiplanner/CalendarGrid";
import PlannerSidebar from "../layout/PlannerSidebar";
import { Calendar, CheckSquare, ChevronRight } from "lucide-react";
import TodoList from "../planner/TodoList";
import { useCalendar } from "../../hooks/useCalendar";
import { useScheduleFilter } from "../../hooks/useScheduleFilter";
import ScheduleModal from "../planner/ScheduleModal";

const PlannerPage = () => {
  // 기본 상태들
  //const initialPlanner=1001;
  //const [defaultPlanner,setDefaultPlanner] = useState(initialPlanner);
  const [viewMode, setViewMode] = useState("monthly"); // 'monthly' or 'weekly
  const [plannerSidebarOpen, setPlannerSidebarOpen] = useState(true);
  const [nowPlanner, setNowPlanner] = useState(1001); //일정 필터링 테스트용 하드코딩⚠️나중에 바꿔야됨요
  const [openScModal, setOpenScModal] = useState(false);
  const [selectedSc, setSelectedSc] = useState(null); //현재 선택된 스케쥴을 나타냄
  //날짜 설정

  const calendar = useCalendar();

  const scheduleFilter = useScheduleFilter({
    nowPlanner,
    currentDate: calendar.currentDate,
  });
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 overflow-y-auto">
        <button
          //사이드바 접었다 폈다
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
            sidebarClassName="xl:block hidden"
            viewMode={viewMode}
            // year={calendar.year}
            //month={calendar.month}
            currentDate={calendar.currentDate}
            setCurrentDate={calendar.setCurrentDate}
            weeks={calendar.weeks}
            setViewMode={setViewMode}
            weekNames={calendar.weekNames}
            nowPlanner={nowPlanner}
            openScModal={openScModal}
            setOpenScModal={setOpenScModal}
            selectedSc={selectedSc}
            setSelectedSc={setSelectedSc}
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
            openScModal={openScModal}
            setOpenScModal={setOpenScModal}
            selectedSc={selectedSc}
            setSelectedSc={setSelectedSc}
            nowPlanner={nowPlanner}
            setNowPlanner={setNowPlanner}
          />
        </div>

        {/**여기에 그 뭐냐 그룹 플래너 사이드바 들어가면 될 것 같다는...아닌가..대가리가 아픈 것 같다는 */}
        {openScModal && (
          <ScheduleModal
            openScModal={openScModal}
            setOpenScModal={setOpenScModal}
            setSelectedSc={setSelectedSc}
            selectedSc={selectedSc}
            scFilter={scheduleFilter}
          />
        )}
      </div>
    </div>
  );
};

export default PlannerPage;
