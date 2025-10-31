import { useState, useEffect } from "react";

const PlannerListModal = ({ viewMode }) => {
  const [mode, setMode] = useState(viewMode);

  const handleMode = () => {
    if (mode === "personal") {
      setMode("team");
      //팀플래너 리스트 반환
    } else if (mode === "team") {
      setMode("personal");
      //개인플래너 리스트 반환

      //팔로워리스트 모달 긁어서 좀 바꿔도 될듯
    }
  };
  return (
    <div>
      <h>플래너 리스트</h>
      <button className="bg-red-300" onClick={handleMode}>
        개인 플래너
      </button>
      <button className="bg-red-300" onClick={handleMode}>
        공유 플래너
      </button>
    </div>
  );
};
export default PlannerListModal;
