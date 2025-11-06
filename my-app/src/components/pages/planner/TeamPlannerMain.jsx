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
  const { openScModal, nowPlanner, setNowPlanner } = usePlannerContext();
  const { currentPlanner, setCurrentPlanner, planners, fetchPlanners } =
    useTeamPlanner();
  const { plannerId } = useParams();

  // URL의 plannerId를 Context에 반영
  useEffect(() => {
    const loadPlanner = async () => {
      if (!plannerId) return;

      const plannerIdNum = Number(plannerId);

      // Context의 nowPlanner 업데이트 (localStorage 자동 저장됨!)
      setNowPlanner(plannerIdNum);

      // TeamPlanner의 currentPlanner 설정
      const existing = planners.find((p) => p.plannerId === plannerIdNum);

      if (existing) {
        setCurrentPlanner(existing);
      } else {
        // 플래너 목록 새로 불러오기
        await fetchPlanners();
        const planner = planners.find((p) => p.plannerId === plannerIdNum);
        if (planner) {
          setCurrentPlanner(planner);
        } else {
          // 플래너를 못 찾으면 목록 페이지로
          console.error("플래너를 찾을 수 없습니다:", plannerIdNum);
          navigate("/planner/list/shared");
        }
      }
    };
    console.log("너는 이름이 머니?", currentPlanner);
    loadPlanner();
  }, [
    plannerId,
    planners,
    setNowPlanner,
    setCurrentPlanner,
    fetchPlanners,
    navigate,
  ]);

  /*
  const scheduleFilter = useScheduleGrouping({
    nowPlanner,
    currentDate: calendar.currentDate,
  });

   */

  return (
    <div className="flex flex-1">
      {/* 개인 플래너 사이드바 */}
      {sidebarOpen && <PlannerSidebar sidebarClassName="md:block hidden" />}

      {/* 메인 플래너 영역 */}
      <div className="flex-1 flex flex-col">
        <PlannerHeaderWM />
      </div>
      <TeamMemberSidebar plannerId={nowPlanner} />

      {/* 일정 모달 */}
      {openScModal && <ScheduleModal />}
    </div>
  );
};

export default TeamPlannerMain;
