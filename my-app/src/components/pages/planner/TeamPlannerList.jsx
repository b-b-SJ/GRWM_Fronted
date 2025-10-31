import { useState, useEffect } from "react";

const TeamPlannerList = () => {
  const [createPMode, setCreatePMode] = useState(false);
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
};
export default TeamPlannerList;
