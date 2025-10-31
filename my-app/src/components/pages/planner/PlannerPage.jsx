import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// 개인 플래너 관련
import PersonalPlannerMain from "../../planner/PersonalPlannerMain";
//import PersonalPlannerCreate from "../planner/personal/PersonalPlannerCreate";

// 공유 플래너 관련
import TeamPlannerMain from "./TeamPlannerMain";

const PlannerPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
            <Route
              path="/"
              element={<PersonalPlannerMain sidebarOpen={sidebarOpen} />}
            />

            {/* 공유 플래너 */}

            <Route path="/shared" element={<TeamPlannerMain />} />

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
