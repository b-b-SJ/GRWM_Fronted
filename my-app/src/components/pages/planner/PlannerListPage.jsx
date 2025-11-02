// src/components/planner/PlannerListPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { Plus, Users, User, ArrowLeft } from "lucide-react";
import CreatePlannerModal from "../../planner/CreatePlannerModal";

const PlannerListPage = () => {
  const { type } = useParams(); // "shared" 또는 "personal"
  const navigate = useNavigate();
  const { planners, fetchPlanners, loading } = useTeamPlanner();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isShared = type === "shared";

  // 공유 플래너 목록 불러오기
  useEffect(() => {
    if (isShared) {
      fetchPlanners();
    }
  }, [type]);

  // 플래너 생성 성공 시
  const handleCreateSuccess = (plannerId) => {
    if (isShared) {
      fetchPlanners(); // 목록 새로고침
      navigate(`/planner/shared/${plannerId}`); // 생성된 플래너로 이동
    }
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
    <div className="flex-1 p-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)} // 뒤로가기
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-3xl font-bold">
          {isShared ? "공유 플래너" : "개인 플래너"}
        </h1>

        {/* 새 플래너 만들기 버튼 */}
        {isShared && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />새 플래너
          </button>
        )}
      </div>

      {/* 공유 플래너 목록 */}
      {isShared ? (
        planners.length === 0 ? (
          // 플래너가 없을 때
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users size={48} className="text-blue-500" />
            </div>
            <p className="text-xl text-gray-500 mb-4">공유 플래너가 없어요</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              첫 플래너 만들기
            </button>
          </div>
        ) : (
          // 플래너 목록 그리드
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planners.map((planner) => (
              <div
                key={planner.plannerId}
                onClick={() => navigate(`/planner/shared/${planner.plannerId}`)}
                className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition hover:border-blue-400"
              >
                {/* 플래너 이미지 */}
                {planner.profileImageLink ? (
                  <img
                    src={planner.profileImageLink}
                    alt={planner.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Users size={48} className="text-gray-400" />
                  </div>
                )}

                {/* 플래너 정보 */}
                <h3 className="font-bold text-xl mb-2">{planner.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {planner.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>멤버 {planner.members?.length || 0}명</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // 개인 플래너 목록 (나중에 구현)
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <User size={48} className="text-green-500" />
          </div>
          <p className="text-xl text-gray-500 mb-4">개인 플래너 목록</p>
          <p className="text-sm text-gray-400">준비 중입니다</p>
        </div>
      )}

      {/* 생성 모달 (공유 플래너만) */}
      {isShared && (
        <CreatePlannerModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default PlannerListPage;
