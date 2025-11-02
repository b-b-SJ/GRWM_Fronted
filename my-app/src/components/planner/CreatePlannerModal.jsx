// src/components/planner/groupPlanner/CreatePlannerModal.jsx
import React, { useState } from "react";
import { X, Users } from "lucide-react";
import { useTeamPlanner } from "../../hooks/TeamPlannerProvider";

const CreatePlannerModal = ({ isOpen, onClose, onSuccess }) => {
  const { createPlanner, loading } = useTeamPlanner();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    profileImage: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("플래너 이름을 입력하세요!");
      return;
    }

    try {
      const plannerId = await createPlanner(formData);
      alert("플래너가 생성되었습니다!");
      onSuccess(plannerId); // 성공 시 콜백
      onClose();

      // 폼 초기화
      setFormData({ title: "", description: "", profileImage: "" });
    } catch (error) {
      alert("플래너 생성 실패: " + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">새 공유 플래너 만들기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* 폼 내용 */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* 프로필 이미지 (선택) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                플래너 이미지{" "}
                <span className="text-gray-400 text-xs">(선택)</span>
              </label>
              <div className="flex items-center gap-4">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="미리보기"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users size={32} className="text-gray-400" />
                  </div>
                )}
                <input
                  type="url"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  placeholder="이미지 URL을 입력하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 플래너 이름 (필수) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                플래너 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 우리 팀의 프로젝트"
                maxLength={20}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/20
              </p>
            </div>

            {/* 설명 (선택) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                설명 <span className="text-gray-400 text-xs">(선택)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="이 플래너에 대한 간단한 설명을 입력하세요"
                maxLength={100}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/100
                </p>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "생성 중..." : "만들기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlannerModal;
