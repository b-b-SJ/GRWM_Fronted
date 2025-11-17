import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useOutletContext,
} from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PlannerProvider } from "../../../hooks/PlannerContext";

//공통
import PlannerListPage from "./PlannerListPage";

// 개인+공유
import PlannerMain from "./PlannerMain";

const PlannerPage = () => {
  const { plannerSidebarOpen, setPlannerSidebarOpen, togglePlannerSidebar } =
    useOutletContext();
  return (
    <div className="relative flex-col flex flex-1">
      <div className="flex flex-1 overflow-y-auto">
        {/* 사이드바 토글 버튼 */}

        {/* 메인 콘텐츠 - 라우팅 */}
        <div className="flex-1 min-w-0">
          <Routes>
            {/*  기본 경로 - 리다이렉트  */}
            <Route path="/" element={<DefaultPlannerRedirect />} />

            {/* 개인 플래너 */}
            <Route path="/personal" element={<PersonalPlannerRedirect />} />
            <Route
              path="/personal/:plannerId"
              element={
                <PlannerProvider plannerType="personal">
                  <PlannerMain sidebarOpen={plannerSidebarOpen} />
                </PlannerProvider>
              }
            />

            {/* 공유 플래너 */}
            <Route path="/shared" element={<SharedPlannerRedirect />} />
            <Route
              path="/shared/:plannerId"
              element={
                <PlannerProvider plannerType="shared">
                  <PlannerMain sidebarOpen={plannerSidebarOpen} />
                </PlannerProvider>
              }
            />

            <Route
              path="/list/:type"
              element={
                <PlannerProvider>
                  <PlannerListPage />{" "}
                </PlannerProvider>
              }
            />
            <Route path="*" element={<Navigate to="/planner" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// redirection 역할 해줄 컴포넌트들
const DefaultPlannerRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lastType = localStorage.getItem("lastPlannerType");
    const lastSharedId = localStorage.getItem("planner_last_shared_id");
    const lastPersonalId = localStorage.getItem("planner_last_personal_id");

    console.log(" DefaultRedirect 체크:", {
      lastType,
      lastSharedId,
      lastPersonalId,
    });

    if (lastType === "shared" && lastSharedId) {
      navigate(`/planner/shared/${lastSharedId}`, { replace: true });
    } else if (lastType === "personal" && lastPersonalId) {
      navigate(`/planner/personal/${lastPersonalId}`, { replace: true });
    } else if (lastSharedId) {
      navigate(`/planner/shared/${lastSharedId}`, { replace: true });
    } else if (lastPersonalId) {
      navigate(`/planner/personal/${lastPersonalId}`, { replace: true });
    } else {
      // 아무것도 없으면 personal 목록으로
      navigate("/planner/list/personal", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-lg text-gray-500">플래너로 이동 중...</div>
    </div>
  );
};

const PersonalPlannerRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lastPersonalId = localStorage.getItem("planner_last_personal_id");

    console.log(" PersonalRedirect:", lastPersonalId);

    if (lastPersonalId) {
      navigate(`/planner/personal/${lastPersonalId}`, { replace: true });
    } else {
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
    const lastSharedId = localStorage.getItem("planner_last_shared_id");

    console.log(" SharedRedirect:", lastSharedId);

    if (lastSharedId) {
      navigate(`/planner/shared/${lastSharedId}`, { replace: true });
    } else {
      navigate("/planner/list/shared", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-lg text-gray-500">공유 플래너로 이동 중...</div>
    </div>
  );
};

export default PlannerPage;
