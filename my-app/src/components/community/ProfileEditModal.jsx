import { useState, useEffect, useRef } from "react";
import { X, Image, Camera, Upload } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { useImgConverter } from "../../hooks/useImgConverter";

const ProfileEditModal = ({ isOpen, onClose, currentProfile, onSave }) => {
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    nickname: "",
    description: "",
    profileImage: "",
    bannerImage: "",
  });

  // 이미지 업로드 훅 사용
  const { getImageUrl, isUploading } = useImgConverter();

  // 파일 input ref (배너용, 프로필용 각각)
  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

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

  // 배너 이미지 업로드
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("배너 이미지 업로드 시작:", file.name);

    try {
      const uploadedUrl = await getImageUrl(file);

      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          bannerImage: uploadedUrl,
        }));
        console.log("배너 이미지 업로드 성공:", uploadedUrl);
      } else {
        alert("배너 이미지 업로드에 실패했습니다");
      }
    } catch (error) {
      console.error("배너 이미지 업로드 에러:", error);
      alert("배너 이미지 업로드 중 오류가 발생했습니다");
    }

    // input 초기화
    e.target.value = "";
  };

  // 프로필 이미지 업로드
  const handleProfileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("프로필 이미지 업로드 시작:", file.name);

    try {
      const uploadedUrl = await getImageUrl(file);

      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          profileImage: uploadedUrl,
        }));
        console.log("프로필 이미지 업로드 성공:", uploadedUrl);
      } else {
        alert("프로필 이미지 업로드에 실패했습니다");
      }
    } catch (error) {
      console.error("프로필 이미지 업로드 에러:", error);
      alert("프로필 이미지 업로드 중 오류가 발생했습니다");
    }

    // input 초기화
    e.target.value = "";
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
              배너 이미지
            </label>
            <label
              htmlFor="banner-upload"
              className="relative w-full h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors group"
            >
              {formData.bannerImage ? (
                <>
                  <img
                    src={formData.bannerImage}
                    alt="배너 미리보기"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  {/* 호버 시 오버레이 */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <Upload className="text-white mb-2" />
                    <span className="text-white text-sm">이미지 변경</span>
                  </div>
                </>
              ) : (
                <>
                  <Image
                    size={40}
                    className="text-gray-400 group-hover:text-blue-500 transition-colors"
                  />
                  {/* 호버 시 오버레이 */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <Upload size={32} className="text-white mb-2" />
                    <span className="text-white text-sm">이미지 업로드</span>
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

            {/* 숨겨진 파일 input */}
            <input
              id="banner-upload"
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              disabled={isUploading}
              className="hidden"
            />

            <p className="text-xs text-gray-500 mt-2">
              클릭하여 배너 이미지 업로드
            </p>
          </div>

          {/* 프로필 이미지 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              프로필 이미지
            </label>
            <div className="flex justify-center">
              <label
                htmlFor="profile-upload"
                className="relative w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors group"
              >
                {formData.profileImage ? (
                  <>
                    <img
                      src={formData.profileImage}
                      alt="프로필 미리보기"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {/* 호버 시 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                      <Camera size={28} className="text-white mb-1" />
                      <span className="text-white text-xs">변경</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera
                      size={40}
                      className="text-gray-400 group-hover:text-blue-500 transition-colors"
                    />
                    {/* 호버 시 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                      <Upload size={28} className="text-white mb-1" />
                      <span className="text-white text-xs">업로드</span>
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

              {/* 숨겨진 파일 input */}
              <input
                id="profile-upload"
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              클릭하여 프로필 이미지 업로드
            </p>
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
              maxLength={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.nickname.length}/15
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
            disabled={isUploading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isUploading ? "업로드 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
