import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../../hooks/AuthContext";
import {
  PlannerProvider,
  usePlannerContext,
} from "../../../hooks/PlannerContext";

//공통
import PlannerListPage from "./PlannerListPage";

// 개인 플래너 관련
import PersonalPlannerMain from "./PersonalPlannerMain";
//import PersonalPlannerCreate from "../planner/personal/PersonalPlannerCreate";

// 공유 플래너 관련
import TeamPlannerMain from "./TeamPlannerMain";

const PlannerPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { user } = useAuth();
  useEffect(() => {
    if (user?.userId) {
      console.log("사용자 감지:", user.userId);

      // 저장된 userId와 비교
      const savedUserId = localStorage.getItem("lastUserId");

      if (savedUserId && savedUserId !== String(user.userId)) {
        // 다른 계정!
        console.log("다른 계정 감지! localStorage 초기화");
        localStorage.removeItem("lastPlannerType");
        localStorage.removeItem("lastSharedPlannerId");
        localStorage.removeItem("lastPersonalPlannerId");
      }

      // 현재 userId 저장
      localStorage.setItem("lastUserId", user.userId);
    }
  }, [user?.userId]);

  const PersonalPlannerRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const lastPersonalId = localStorage.getItem("lastPersonalPlannerId");

      console.log(" PersonalPlannerRedirect:", lastPersonalId);

      if (lastPersonalId) {
        navigate(`/planner/personal/${lastPersonalId}`, { replace: true });
      } else {
        // 없으면 목록으로 (나중에 구현)
        // 지금은 기본 플래너로
        navigate("/planner/list/personal", { replace: true });
      }
    }, [navigate]);

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">개인 플래너로 이동 중...</div>
      </div>
    );
  };
  const SharedPlannerRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const lastSharedId = localStorage.getItem("lastSharedPlannerId");

      console.log(" SharedPlannerRedirect:", lastSharedId);

      if (lastSharedId) {
        navigate(`/planner/shared/${lastSharedId}`, { replace: true });
      } else {
        // 없으면 목록으로
        navigate("/planner/list/shared", { replace: true });
      }
    }, [navigate]);

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">공유 플래너로 이동 중...</div>
      </div>
    );
  };
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
            <PlannerProvider>
              {/* 기본 경로 - 리다이렉트 */}
              <Route path="/" element={<DefaultPlannerRedirect />} />
              <Route path="/personal" element={<PersonalPlannerRedirect />} />
              <Route path="/shared" element={<SharedPlannerRedirect />} />

              {/* 플래너 목록 */}
              <Route path="/list/:type" element={<PlannerListPage />} />

              {/* 개인 플래너 상세 */}
              <Route
                path="/personal/:plannerId"
                element={<PersonalPlannerMain sidebarOpen={sidebarOpen} />}
              />

              {/* 공유 플래너 상세 */}
              <Route
                path="/shared/:plannerId"
                element={<TeamPlannerMain sidebarOpen={sidebarOpen} />}
              />

              {/* 잘못된 경로 */}
              <Route path="*" element={<Navigate to="/planner" replace />} />
            </PlannerProvider>
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
