// src/components/planner/PlannerListPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentPlanner } from "../../../hooks/useCurrentPlanner";

import { Plus, Users, User, ArrowLeft, Settings } from "lucide-react";
import CreatePlannerModal from "../../planner/plannerBasicCRUD/CreatePlannerModal";
import EditPlannerModal from "../../planner/plannerBasicCRUD/EditPlannerModal";

const PlannerListPage = () => {
  const { type } = useParams(); // "shared" 또는 "personal"
  const navigate = useNavigate();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedPlanner, setSelectedPlanner] = useState(null);
  const isShared = type === "shared";
  const {
    planners,
    fetchPlanners,
    deletePlanner,
    updatePlanner,
    loading,
    error,
  } = useCurrentPlanner(type);

  // 공유 플래너 목록 불러오기
  useEffect(() => {
    console.log(`플래너 목록 로딩 시작 (type: ${type})`);
    console.log("뭐 저장?", localStorage);
    fetchPlanners();
  }, [type, fetchPlanners]);

  // 플래너 생성 성공 시
  const handleCreateSuccess = (plannerId) => {
    // localStorage에 저장
    localStorage.setItem(`planner_last_${type}_id`, String(plannerId));
    localStorage.setItem("lastPlannerType", type);

    fetchPlanners();
    navigate(`/planner/${type}/${plannerId}`); // 생성된 플래너로 이동
  };

  // 로딩 중
  if (loading && isShared) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 ">
      <div></div>
      <div className="flex-1 p-8">
        {/* 헤더 */}
        <div className="mb-8">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">뒤로가기</span>
          </button>

          {/* 탭과 타이틀 */}
          <div className="flex items-center justify-between">
            {/* 왼쪽: 타이틀 */}
            <h1 className="text-3xl font-bold text-gray-900">
              {isShared ? "공유 플래너" : "개인 플래너"}
            </h1>

            {/* 오른쪽: 탭 전환 버튼 */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => navigate("/planner/list/shared")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isShared
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>공유 플래너</span>
                </div>
              </button>
              <button
                onClick={() => navigate("/planner/list/personal")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !isShared
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>개인 플래너</span>
                </div>
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className="mt-6 border-b border-gray-200"></div>
        </div>
        {/* 공유 플래너 목록 */}
        {planners.length === 0 ? (
          // 플래너가 없을 때
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {isShared ? (
                <Users size={48} className="text-blue-500" />
              ) : (
                <User size={48} className="text-green-500 " />
              )}
            </div>
            <p className="text-xl text-gray-500 mb-4">
              {isShared
                ? `아직 공유 플래너가 없어요`
                : `아직 개인 플래너가 없어요`}
            </p>
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              첫 플래너 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {planners.map((planner) => (
              <div
                key={planner.plannerId}
                className="relative bg-white border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              >
                {/* 플래너 카드 내용 */}
                <div
                  onClick={() =>
                    navigate(`/planner/${type}/${planner.plannerId}`)
                  }
                  className="flex items-center gap-6"
                >
                  {/*  왼쪽: 플래너 이미지 */}
                  <div className="flex-shrink-0">
                    {planner.profileImage ? (
                      <img
                        src={planner.profileImage}
                        alt={planner.title}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-300 rounded-lg flex items-center justify-center">
                        <Users size={48} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* 플래너 정보 */}
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{planner.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {planner.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      참여자 :{" "}
                      {planner.members
                        ?.map((m) => m.nickname || m.username)
                        .join(", ") || "~~~~~~~"}
                    </p>
                  </div>
                </div>

                {/* 오른쪽 상단: 설정 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanner(planner);
                    setOpenEditModal(true);
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="플래너 설정"
                >
                  <Settings size={20} className="text-gray-500" />
                </button>
              </div>
            ))}

            {/* 플래너 추가 버튼 */}
            <button
              onClick={() => setOpenCreateModal(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Plus size={32} className="text-gray-400" />
              <span className="text-gray-500">새 플래너 만들기</span>
            </button>
          </div>
        )}

        {/* 생성 모달 (공유 플래너만) */}

        <CreatePlannerModal
          isOpen={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />

        {openEditModal && (
          <EditPlannerModal
            isOpen={openEditModal}
            onClose={() => setOpenEditModal(false)}
            planner={selectedPlanner}
            onSuccess={() => {
              fetchPlanners(); // 플래너 목록 새로고침
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PlannerListPage;
