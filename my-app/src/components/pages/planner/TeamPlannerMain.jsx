import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import { useCalendar } from "../../../hooks/useCalendar";
import { useScheduleGrouping } from "../../../hooks/useScheduleFilter"; //일정 보여주기 전에 그룹핑할 때 사용했엇슨
import PlannerSidebar from "../../layout/PlannerSidebar";
import PlannerHeaderWM from "../../planner/PlannerHeaderWM";
import ScheduleModal from "../../planner/ScheduleModal";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import TeamMemberSidebar from "../../planner/teamPlanner/TeamMemberSidebar";
import { usePlannerContext } from "../../../hooks/PlannerContext";

const TeamPlannerMain = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const { openScModal } = usePlannerContext();
  const { currentPlanner, setCurrentPlanner, planners, fetchPlanners } =
    useTeamPlanner();
  const { plannerId } = useParams();

  //임시였슨, 로컬 스토리지 사용할 예정<< 로컬 스토리지 관리는 plannerPage해서 해야할 것 같긴합니다
  const [nowPlanner, setNowPlanner] = useState(Number(plannerId));
  useEffect(() => {
    const loadPlanner = async () => {
      if (plannerId) {
        // 플래너 정보 로드
        const existing = planners.find(
          (p) => p.plannerId === Number(plannerId)
        );

        if (existing) {
          setCurrentPlanner(existing);
        } else {
          await fetchPlanners();
          const planner = planners.find(
            (p) => p.plannerId === Number(plannerId)
          );
          if (planner) {
            setCurrentPlanner(planner);
          }
        }

        // localStorage에 저장
        localStorage.setItem("lastPlannerType", "shared");
        localStorage.setItem("lastSharedPlannerId", plannerId);

        console.log("공유 플래너 저장:", plannerId);
      }
    };

    loadPlanner();
  }, [plannerId]);

  /*
  const scheduleFilter = useScheduleGrouping({
    nowPlanner,
    currentDate: calendar.currentDate,
  });

   */

  return (
    <div className="flex flex-1">
      {/* 개인 플래너 사이드바 */}
      {sidebarOpen && (
        <PlannerSidebar
          sidebarClassName="md:block hidden"
          nowPlanner={nowPlanner}
        />
      )}

      {/* 메인 플래너 영역 */}
      <div className="flex-1 flex flex-col">
        <PlannerHeaderWM nowPlanner={nowPlanner} plannerType="shared" />
      </div>
      <TeamMemberSidebar plannerId={nowPlanner} />

      {/* 일정 모달 */}
      {openScModal && <ScheduleModal />}
    </div>
  );
};

export default TeamPlannerMain;
