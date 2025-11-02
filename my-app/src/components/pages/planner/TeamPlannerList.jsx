// SharedPlannerList.jsx에 추가
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { Plus, Users } from "lucide-react";
import CreatePlannerModal from "../../planner/CreatePlannerModal";

const SharedPlannerList = () => {
  const navigate = useNavigate();
  const { planners, fetchPlanners, loading } = useTeamPlanner();
  const [showCreateModal, setShowCreateModal] = useState(false); // ✅ 추가

  useEffect(() => {
    fetchPlanners();
  }, []);

  // ✅ 플래너 생성 성공 시
  const handleCreateSuccess = (plannerId) => {
    fetchPlanners(); // 목록 새로고침
    navigate(`/planner/shared/${plannerId}`); // 생성된 플래너로 이동
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">로딩 중...</div>
    );
  }

  return (
    <div className="flex-1 p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">공유 플래너</h1>
        <button
          onClick={() => setShowCreateModal(true)} // ✅ 모달 열기
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={20} />새 플래너
        </button>
      </div>

      {/* 플래너 없을 때 */}
      {planners.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Users size={48} className="text-blue-500" />
          </div>
          <p className="text-xl text-gray-500 mb-4">공유 플래너가 없어요</p>
          <button
            onClick={() => setShowCreateModal(true)} // ✅ 모달 열기
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            첫 플래너 만들기
          </button>
        </div>
      ) : (
        /* 플래너 목록 */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planners.map((planner) => (
            <div
              key={planner.plannerId}
              onClick={() => navigate(`/planner/shared/${planner.plannerId}`)}
              className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition hover:border-blue-400"
            >
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
      )}

      {/* ✅ 생성 모달 */}
      <CreatePlannerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default SharedPlannerList;
