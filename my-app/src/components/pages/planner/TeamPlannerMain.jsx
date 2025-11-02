import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCalendar } from "../../../hooks/useCalendar";
import { useScheduleFilter } from "../../../hooks/useScheduleFilter";
import PlannerSidebar from "../../layout/PlannerSidebar";
import PlannerHeaderWM from "../../planner/PlannerHeaderWM";
import ScheduleModal from "../../planner/ScheduleModal";

const TeamPlannerMain = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const calendar = useCalendar();

  const [viewMode, setViewMode] = useState("monthly");
  const [nowPlanner, setNowPlanner] = useState(1001);
  const [openScModal, setOpenScModal] = useState(false);
  const [selectedSc, setSelectedSc] = useState(null);

  const scheduleFilter = useScheduleFilter({
    nowPlanner,
    currentDate: calendar.currentDate,
  });

  return (
    <div className="flex flex-1">
      {/* 개인 플래너 사이드바 */}
      {sidebarOpen && (
        <PlannerSidebar
          sidebarClassName="md:block hidden"
          viewMode={viewMode}
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
          // 공유 플래너로 이동 버튼
          //onNavigateToShared={() => navigate("/planner/shared")}
        />
      )}

      {/* 메인 플래너 영역 */}
      <div className="flex-1 flex flex-col">
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
          weekFound={calendar.weekFound}
          month={calendar.month}
          openScModal={openScModal}
          setOpenScModal={setOpenScModal}
          selectedSc={selectedSc}
          setSelectedSc={setSelectedSc}
          nowPlanner={nowPlanner}
          setNowPlanner={setNowPlanner}
          plannerType="shared"
        />
      </div>

      {/* 일정 모달 */}
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
  );
};

export default TeamPlannerMain;
