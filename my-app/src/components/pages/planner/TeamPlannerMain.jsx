import { useState, useEffect } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";

const TeamPlannerMain = () => {
  const { fetchPlanners, planners, user, createPlanner } = useTeamPlanner();
  const [createPMode, setCreatePMode] = useState(false);

  //들어오면 플래너 리스트 가져오게 만드는 거
  useEffect(() => {
    if (user) {
      fetchPlanners();
    }
  }, [user]);

  // 플래너 생성

  console.log("뭐가", planners);

  if (planners.length === 0) {
    return (
      <div className="bg-red-700">
        <h className="text-2xl">공유 플래너가 없습니다.</h>

        {/* 플래너 생성 
        "plannerId"
"title"
"description"
"profileImage"
"members"
        */}

        <button onClick={() => setCreatePMode(true)}>플래너 생성하기</button>
      </div>
    );
  }
  return <div>공유 플래너 있긴 함</div>;
};
export default TeamPlannerMain;
