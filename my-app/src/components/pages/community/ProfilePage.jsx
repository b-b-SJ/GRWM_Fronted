import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserRound, Ellipsis, Award } from "lucide-react";
import { useProfile } from "../../../hooks/useProfile";
import { useAuth } from "../../../hooks/AuthContext";
import { usePost } from "../../../hooks/usePost";
import PostList from "../../community/PostList";
import ProfileEditModal from "../../community/ProfileEditModal";
const ProfilePage = ({ isMyProfile, setIsMyProfile }) => {
  const {
    profile,
    loadingProfile,
    error,
    getUserProfile,
    followUser,
    unfollowUser,
    blockUser,
    updateUserProfile,
  } = useProfile();

  const { posts, getUserPosts } = usePost();
  const param = useParams();
  const { user } = useAuth();
  const currentProfileId = Number(param.communityId);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [manageModal, setManageModal] = useState(false);
  // 초기 로드
  useEffect(() => {
    const loadProfile = async () => {
      if (currentProfileId && user.userId) {
        setIsMyProfile(currentProfileId === user.userId);
        await getUserProfile(currentProfileId);
        await getUserPosts(currentProfileId);
      }
    };
    loadProfile();
  }, [currentProfileId, user.userId]);

  // updateUserProfile 함수를 호출하는 핸들러 추가
  const handleSaveProfile = async (formData) => {
    try {
      await updateUserProfile(currentProfileId, formData);
      alert("프로필이 수정되었습니다!");
    } catch (error) {
      alert("프로필 수정에 실패했습니다.");
    }
  };

  // 게시물 변경 핸들러 (생성, 수정, 삭제 모두 처리)
  const handlePostsChange = async (mode, data) => {
    console.log(`게시물 ${mode}됨:`, data);

    // 프로필 정보 새로고침 (postCount 업데이트)
    await getUserProfile(currentProfileId);

    // create나 delete는 목록 전체 새로고침
    // edit는 PostList가 이미 업데이트했으니 안 해도 됨
    if (mode === "create" || mode === "delete") {
      await getUserPosts(currentProfileId);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">에러: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500">프로필을 찾을 수 없습니다.</div>
      </div>
    );
  }
  const handleMenuClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setModalPosition({
      top: `${rect.right - 10 + window.scrollX}px`,
      left: `${rect.bottom + 100 + window.scrollY}px`,
    });

    setManageModal(!manageModal);
  };
  return (
    <div className="bg-white min-h-screen mt-10">
      {/* 프로필 헤더 */}
      <div className="shadow-sm">
        {/* 배너 */}
        <div className="max-w-full aspect-[32/2]">
          {profile.bannerImage ? (
            <img
              src={profile.bannerImage}
              alt="배너"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-400"></div>
          )}
        </div>

        {/* 프로필 정보 */}
        <div className="mt-7 px-6 py-4 flex pb-12 border-b">
          {/* 프로필 사진 */}
          <div>
            {profile.user.profileImage ? (
              <img
                src={profile.user.profileImage}
                alt="프로필"
                className="w-48 h-48 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                <UserRound className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* 닉네임, 팔로우 버튼, 통계 */}
          <div className="flex flex-col flex-1 p-6 gap-y-6">
            <h2 className="font-bold text-2xl">{profile.user.nickname}</h2>

            {/* 팔로우 버튼 */}
            <div className="flex items-center gap-5">
              {isMyProfile ? (
                <button
                  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  프로필 편집
                </button>
              ) : (
                <>
                  {profile.relationship === "followedByMe" ? (
                    <button
                      className="group px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-red-500 transition-colors"
                      onClick={() => unfollowUser(currentProfileId)}
                    >
                      <span className="group-hover:hidden">팔로우 중</span>
                      <span className="hidden group-hover:inline">
                        언팔로우
                      </span>
                    </button>
                  ) : (
                    <button
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      onClick={() => followUser(currentProfileId)}
                    >
                      팔로우
                    </button>
                  )}
                </>
              )}

              {/* 블락 접근 */}
              {!isMyProfile && (
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setManageModal(!manageModal)}
                  style={manageModal.modal} //나중에 모달 만들면 쓰기 -> blockUser(currentProfileId),
                >
                  <Ellipsis size={24} />
                </button>
              )}
              {manageModal && (
                <button
                  className="bg-red-400 "
                  onClick={() => {
                    alert("신고되었습니다");
                  }}
                >
                  신고하다
                </button>
              )}
            </div>

            {/* 통계 */}
            <div className="flex gap-8 text-center justify-center">
              <div>
                <p className="text-gray-500 text-sm">게시물</p>
                <p className="font-bold text-lg">{profile.postCount}</p>
              </div>
              <button className="hover:opacity-70 transition-opacity">
                <p className="text-gray-500 text-sm">팔로워</p>
                <p className="font-bold text-lg">{profile.followerCount}</p>
              </button>
              <button className="hover:opacity-70 transition-opacity">
                <p className="text-gray-500 text-sm">팔로잉</p>
                <p className="font-bold text-lg">{profile.followingCount}</p>
              </button>
            </div>
          </div>

          {/**뱃지 */}
          <button className="w-24 h-24  ml-auto rounded-full bg-rose-200 justify-center items-center grid">
            <Award
              className="text-rose-400 col-start-1 row-start-1"
              size={60}
            />
            <div className="font-bold text-4xl col-start-1 row-start-1 drop-shadow-md ">
              {profile.achievedBadgeCount}
            </div>
          </button>
        </div>

        {/* 바이오 */}
        {profile.description && (
          <div className="p-6 text-gray-700">{profile.description}</div>
        )}
      </div>

      {/* ✅ 게시물 목록 */}
      <div className="">
        <PostList
          posts={posts}
          onPostsChange={handlePostsChange} // ✅ 콜백 전달
        />
      </div>
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage;
