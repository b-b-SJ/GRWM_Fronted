import { useState, useEffect } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { useNavigate } from "react-router-dom";
const TeamPlannerMain = () => {
  const { fetchPlanners, planners, user } = useTeamPlanner();

  const navigate = useNavigate();
  //들어오면 플래너 리스트 가져오게 만드는 거
  useEffect(() => {
    if (user) {
      fetchPlanners();
    }
  }, [user]);

  // 플래너 생성

  console.log("뭐가", planners);

  if (planners.length === 0) {
    navigate("/planner/shared/list");
  }
  return <div>공유 플래너 있긴 함</div>;
};
export default TeamPlannerMain;
