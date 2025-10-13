import { useState, useEffect } from "react";
import { X, Image, Camera } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";

const ProfileEditModal = ({ isOpen, onClose, currentProfile, onSave }) => {
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    nickname: "",
    description: "",
    profileImage: "",
    bannerImage: "",
  });

  // 모달이 열릴 때 현재 프로필 정보로 폼 초기화
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        nickname: currentProfile.user?.nickname || "",
        description: currentProfile.description || null,
        profileImage: currentProfile.user?.profileImage || null,
        bannerImage: currentProfile.bannerImage || null,
      });
    }
  }, [currentProfile, isOpen]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 저장 버튼 클릭
  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
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
          <h2 className="text-xl font-bold">프로필 편집</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* 폼 내용 */}
        <div className="p-6 space-y-6">
          {/* 배너 이미지 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              배너 이미지 자리
            </label>
            <button className="bg-slate-400 w-full py-3 justify-center items-center flex">
              <Image size={20} />
            </button>

            {/* 미리보기 */}
            {formData.bannerImage && (
              <div className="mt-2 w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={formData.bannerImage}
                  alt="배너 미리보기"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "";
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* 프로필 이미지 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              프로필 이미지 URL
            </label>
            <button className="bg-slate-500 p-8 rounded-full">
              <Camera size={20} />
            </button>

            {/* 미리보기 */}
            {formData.profileImage && (
              <div className="mt-2 flex justify-center">
                <img
                  src={formData.profileImage}
                  alt="프로필 미리보기"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  onError={(e) => {
                    e.target.src = "";
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium mb-2">닉네임</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.nickname.length}/20
            </p>
          </div>

          {/* 한줄 소개 */}
          <div>
            <label className="block text-sm font-medium mb-2">한줄 소개</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="자신을 표출해보세요"
              maxLength={100}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.description && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/120
              </p>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
