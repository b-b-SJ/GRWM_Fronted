import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserRound, Ellipsis, Award } from "lucide-react";
import { useProfile } from "../../../hooks/useProfile";
import { useAuth } from "../../../hooks/AuthContext";
import { usePost } from "../../../hooks/usePost";
import PostList from "../../community/PostList";
import ProfileEditModal from "../../community/ProfileEditModal";
import FollowListModal from "../../community/FollowListModal";
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
    unblockUser,
  } = useProfile();

  const { posts, getUserPosts } = usePost();
  const param = useParams();
  const { user } = useAuth();
  const currentProfileId = Number(param.communityId);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [manageModal, setManageModal] = useState(false);
  const [openFollowListModal, setOpenFollowListModal] = useState(false);
  const [listViewMode, setListViewMode] = useState(null);

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

    if (mode === "create" || mode === "delete") {
      await getUserPosts(currentProfileId);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setModalPosition({
      top: `${rect.right - 10 + window.scrollX}px`,
      left: `${rect.bottom + 100 + window.scrollY}px`,
    });

    setManageModal(!manageModal);
  };

  const handleBlock = async () => {
    // 사용자 확인
    const confirmBlock = window.confirm(
      `${profile.user.nickname}님을 차단하시겠습니까?\n차단하면 서로의 게시물을 볼 수 없게 됩니다.`
    );

    if (!confirmBlock) return; // 취소하면 함수 종료

    try {
      await blockUser(currentProfileId);
      alert("차단되었습니다.");

      //모달 닫기
      setManageModal(false);

      //navigate("/community"); // 커뮤니티 메인으로 이동
    } catch (error) {
      alert("차단에 실패했습니다. 다시 시도해주세요.");
      console.error("차단 실패:", error);
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

  // 🚫 차단된 사용자 프로필 처리 (조기 반환)
  if (
    profile.relationship === "isBlockedByMe" ||
    profile.relationship === "isBlockingMe"
  ) {
    return (
      <div className="bg-white min-h-screen mt-10">
        <div className="shadow-sm">
          {/* 배너 */}
          <div className="max-w-full aspect-[32/2]">
            {profile.bannerImage ? (
              <img
                src={profile.bannerImage}
                alt="배너"
                className="w-full h-full object-cover opacity-50"
              />
            ) : (
              <div className="w-full h-full bg-gray-400"></div>
            )}
          </div>

          {/* 기본 프로필 정보만 */}
          <div className="mt-7 px-6 py-4 flex pb-12 border-b">
            {/* 프로필 사진 */}
            <div>
              {profile.user.profileImage ? (
                <img
                  src={profile.user.profileImage}
                  alt="프로필"
                  className="w-48 h-48 rounded-full border-4 border-white shadow-lg object-cover opacity-50"
                />
              ) : (
                <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <UserRound className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 p-6 gap-y-6">
              <h2 className="font-bold text-2xl text-gray-400">
                {profile.user.nickname}
              </h2>

              {profile.relationship === "isBlockedByMe" ? (
                <button
                  className="group px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-fit"
                  onClick={async () => {
                    const confirm = window.confirm("차단을 해제하시겠습니까?");
                    if (confirm) {
                      // 차단 해제 API 호출 (useProfile에 unblockUser 함수 필요)
                      await unblockUser(currentProfileId);
                      alert("차단이 해제되었습니다.");
                    }
                  }}
                >
                  <span className="group-hover:hidden">차단 중</span>
                  <span className="hidden group-hover:inline">차단 해제</span>
                </button>
              ) : (
                <div className="px-6 py-2 bg-red-600 text-white rounded-lg w-fit">
                  차단 당함
                </div>
              )}
            </div>
          </div>

          {/* 차단 안내 메시지 */}
          <div className="p-12 text-center">
            <div className="inline-block p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg mb-2">
                {profile.relationship === "isBlockedByMe"
                  ? "차단한 사용자입니다"
                  : "차단당한 사용자입니다"}
              </p>
              <p className="text-gray-500 text-sm">
                이 사용자의 게시물과 활동을 볼 수 없습니다
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mt-7 px-6 py-4 flex pb-12 ">
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
                <div className="absolute bg-white shadow-lg rounded-lg p-2 border">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded text-red-500"
                    onClick={handleBlock}
                  >
                    차단하기
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
                    onClick={() => {
                      alert("신고되었습니다");
                      setManageModal(false);
                    }}
                  >
                    신고하기
                  </button>
                </div>
              )}
            </div>

            {/* 통계 */}
            <div className="flex gap-8 text-center justify-center">
              <div>
                <p className="text-gray-500 text-sm">게시물</p>
                <p className="font-bold text-lg">{profile.postCount}</p>
              </div>
              <button
                className="hover:opacity-70 transition-opacity"
                onClick={() => {
                  setOpenFollowListModal(true);
                  setListViewMode("follower");
                }}
              >
                <p className="text-gray-500 text-sm">팔로워</p>
                <p className="font-bold text-lg">{profile.followerCount}</p>
              </button>
              <button
                className="hover:opacity-70 transition-opacity"
                onClick={() => {
                  setOpenFollowListModal(true);
                  setListViewMode("following");
                }}
              >
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
          <div className=" pb-6 px-6 text-gray-700 border-b">
            {profile.description}
          </div>
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
      {openFollowListModal && (
        <FollowListModal
          mode={listViewMode}
          openFollowListModal={openFollowListModal}
          setOpenFollowListModal={setOpenFollowListModal}
          targetId={currentProfileId}
        />
      )}
    </div>
  );
};

export default ProfilePage;
