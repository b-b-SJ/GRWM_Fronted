// src/components/pages/planner/PlannerMain.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePlannerContext } from "../../../hooks/PlannerContext";
import { useCurrentPlanner } from "../../../hooks/useCurrentPlanner";
import PlannerSidebar from "../../layout/PlannerSidebar";
import PlannerHeaderWM from "../../planner/PlannerHeaderWM";
import ScheduleModal from "../../planner/ScheduleModal";
import TeamMemberSidebar from "../../planner/teamPlanner/TeamMemberSidebar";

const PlannerMain = ({ sidebarOpen }) => {
  const { plannerId } = useParams();

  const { openScModal, setNowPlanner, plannerType, isShared } =
    usePlannerContext();

  const { planners, fetchPlanners, setCurrentPlanner } =
    useCurrentPlanner(plannerType);

  //  URL → Context 동기화 (localStorage 자동 저장)
  useEffect(() => {
    if (!plannerId) return;

    const plannerIdNum = Number(plannerId);
    console.log(`🔄 [${plannerType}] URL → Context 동기화:`, plannerIdNum);

    setNowPlanner(plannerIdNum); //  이게 빠졌었음!
  }, [plannerId, plannerType, setNowPlanner]);

  // 플래너 목록 & 현재 플래너 로드
  useEffect(() => {
    const loadPlanner = async () => {
      if (!plannerId) return;

      const plannerIdNum = Number(plannerId);
      console.log(`📋 [${plannerType}] 플래너 로딩:`, plannerIdNum);

      await fetchPlanners();

      const planner = planners.find((p) => p.plannerId === plannerIdNum);

      if (planner) {
        console.log(`✅ [${plannerType}] 플래너 찾음:`, planner.title);
        setCurrentPlanner(planner);
      }
    };

    loadPlanner();
  }, [plannerId, plannerType]);

  return (
    <div className="flex flex-1">
      <PlannerSidebar sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        <PlannerHeaderWM />
      </div>
      {isShared && <TeamMemberSidebar plannerId={Number(plannerId)} />}
      {openScModal && <ScheduleModal />}
    </div>
  );
};

export default PlannerMain;
