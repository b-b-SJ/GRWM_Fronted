import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

//공통
import PlannerListPage from "./PlannerListPage";

// 개인 플래너 관련
import PersonalPlannerMain from "./PersonalPlannerMain";
//import PersonalPlannerCreate from "../planner/personal/PersonalPlannerCreate";

// 공유 플래너 관련
import TeamPlannerMain from "./TeamPlannerMain";

const PlannerPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const DefaultPlannerRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const lastType = localStorage.getItem("lastPlannerType");
      const lastSharedId = localStorage.getItem("lastSharedPlannerId");
      const lastPersonalId = localStorage.getItem("lastPersonalPlannerId");

      if (lastType === "shared" && lastSharedId) {
        navigate(`/planner/shared/${lastSharedId}`, { replace: true });
      } else if (lastType === "personal" && lastPersonalId) {
        navigate(`/planner/personal/${lastPersonalId}`, { replace: true });
      } else if (lastSharedId) {
        navigate(`/planner/shared/${lastSharedId}`, { replace: true });
      } else if (lastPersonalId) {
        navigate(`/planner/personal/${lastPersonalId}`, { replace: true });
      } else if (lastType === "shared") {
        // 아무것도 없으면 공유 플래너 목록으로
        navigate("/planner/list/shared", { replace: true });
      } else {
        navigate("/planner/list/personal", { replace: true });
      }
    }, []);

    return <div>로딩 중...</div>;
  };

  return (
    <div className="relative flex-col flex flex-1">
      <div className="flex flex-1 overflow-y-auto">
        {/* 사이드바 토글 버튼 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-md bg-orange-300"
        >
          <ChevronRight
            size={16}
            className={`transform transition-transform ${
              sidebarOpen ? "scale-x-[-1]" : ""
            }`}
          />
        </button>

        {/* 메인 콘텐츠 - 라우팅 */}
        <div className="flex-1 min-w-0">
          <Routes>
            {/* 개인 플래너 */}
            <Route path="/" element={<DefaultPlannerRedirect />} />
            <Route
              path="/personal/:plannerId"
              element={<PersonalPlannerMain sidebarOpen={sidebarOpen} />}
            />

            <Route path="/list/:type" element={<PlannerListPage />} />
            {/* 공유 플래너 */}

            <Route path="/shared/:plannerId" element={<TeamPlannerMain />} />

            {/* 기본값 - 개인 플래너로 */}
            <Route
              path="*"
              element={<PersonalPlannerMain sidebarOpen={sidebarOpen} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
