// src/components/planner/groupPlanner/EditPlannerModal.jsx
import React, { useState, useEffect } from "react";
import { X, Users, Upload, Images, Trash2 } from "lucide-react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { useCurrentPlanner } from "../../../hooks/useCurrentPlanner";
import { useImgConverter } from "../../../hooks/useImgConverter";
import { useParams } from "react-router-dom";
const EditPlannerModal = ({ isOpen, onClose, planner, onSuccess }) => {
  const { type } = useParams();
  const { updatePlanner, deletePlanner, loading } = useCurrentPlanner(type);
  const { getImageUrl, isUploading } = useImgConverter();
  console.log("plannerId 확인", planner);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    profileImage: "",
  });

  // 모달이 열릴 때 기존 플래너 정보로 폼 초기화
  useEffect(() => {
    if (planner) {
      setFormData({
        title: planner.title || "",
        description: planner.description || "",
        profileImage: planner.profileImage || "",
      });
    }
  }, [planner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await getImageUrl(file);
      setFormData((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));
    } catch (error) {
      alert("이미지 업로드 실패: " + error.message);
    }
  };

  // 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("플래너 이름을 입력하세요!");
      return;
    }

    try {
      await updatePlanner(planner.plannerId, formData);
      alert("플래너가 수정되었습니다!");
      onSuccess();
      onClose();
    } catch (error) {
      alert("플래너 수정 실패: " + error.message);
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (
      !window.confirm(
        "정말로 이 플래너를 삭제하시겠습니까?\n삭제된 플래너는 복구할 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await deletePlanner(planner.plannerId);
      alert("플래너가 삭제되었습니다!");
      onSuccess();
      onClose();
    } catch (error) {
      alert("플래너 삭제 실패: " + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">플래너 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* 폼 내용 */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* 가로 배치: 왼쪽 이미지, 오른쪽 입력 필드들 */}
            <div className="flex gap-6">
              {/* 왼쪽: 프로필 이미지 */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium mb-2">
                  플래너 사진 선택
                </label>
                <label
                  htmlFor="image-upload"
                  className="w-48 h-48 rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors relative group"
                >
                  {formData.profileImage ? (
                    <>
                      <img
                        src={formData.profileImage}
                        alt="미리보기"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      {/* 호버 시 오버레이 */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Images size={32} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Users
                        size={60}
                        className="text-gray-400 group-hover:text-blue-500 transition-colors"
                      />
                      {/* 호버 시 업로드 아이콘 */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload size={32} className="text-white" />
                      </div>
                    </>
                  )}

                  {/* 업로드 중 표시 */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </label>

                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />

                <p className="text-xs text-gray-500 mt-2 text-center">
                  클릭하여 이미지 변경
                </p>
              </div>

              {/* 오른쪽: 제목 & 설명 */}
              <div className="flex-1 space-y-6">
                {/* 플래너 제목 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    플래너 제목 <span className="text-red-500">*</span>
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

                {/* 플래너 설명 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    플래너 설명{" "}
                    <span className="text-gray-400 text-xs">(선택)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="이 플래너에 대한 간단한 설명을 입력하세요"
                    maxLength={100}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/100
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3 justify-between">
            {/* 왼쪽: 삭제 버튼 */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Trash2 size={18} />
              삭제
            </button>

            {/* 오른쪽: 취소/저장 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading || isUploading}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || isUploading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? "저장 중..." : isUploading ? "업로드 중..." : "저장"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlannerModal;
