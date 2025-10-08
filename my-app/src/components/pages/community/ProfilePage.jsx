import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserRound, Ellipsis, Award } from "lucide-react";
import { useProfile } from "../../../hooks/useProfile";
import PostingStyle from "../../community/PostingStyle";
import { useAuth } from "../../../hooks/AuthContext";
import { usePost } from "../../../hooks/usePost";
// 프로필 페이지
const ProfilePage = ({ isMyProfile, setIsMyProfile }) => {
  const {
    profile,
    loadingProfile,
    error,
    getUserProfile,
    followUser,
    unfollowUser,
  } = useProfile();

  const { getUserPostList } = usePost();

  const param = useParams();
  const { user } = useAuth();
  const currentProfileId = Number(param.communityId);
  const [relationship, setRelationship] = useState(null);

  useEffect(() => {
    getUserPostList(currentProfileId);
  }, [currentProfileId, getUserPostList]);
  //const userPost = getUserPostList(currentProfileId);
  console.log(
    "뭐가 undefined?",
    profile.user,
    profile,
    profile.relationship,
    user.userId, //현재 로그인 중인 유저
    currentProfileId
  ); //숫자화 필요

  // 페이지가 처음 보일 때, communityId로 프로필 정보를 요청
  useEffect(() => {
    const loadProfile = async () => {
      if (currentProfileId && user.userId) {
        setIsMyProfile(currentProfileId === user.userId);

        const data = await getUserProfile(currentProfileId);

        if (data && data.relationship) {
          // 안전하게 체크
          setRelationship(data.relationship);
        }
      }
    };

    loadProfile();
  }, [currentProfileId, user.userId]);
  // 로딩, 에러, 빈 상태 처리
  if (loadingProfile) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!profile) return <div>프로필을 찾을 수 없습니다.</div>;

  //팔로잉 팔로우 버튼 토글

  {
    /**
    archivedBadgeCount: 0;
    bannerImage: null;
    description: null;
    followerCount: 0;
    followingCount: 0;
    pinnedPostId: null;
    postCount: 0;
    user: {
    communityId: 3;
    nickname: "무명3";
    profileImage: null;}
     */
  }
  return (
    <div className=" bg-white ">
      <div className=" shadow-md">
        <div className="max-w-full aspect-[32/2]">
          {profile.bannerImage ? (
            <img
              src={profile.bannerImage}
              alt="배너 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300"></div>
          )}
        </div>

        <div className="mt-7 px-6 py-4 flex pb-12 border-b">
          {/**프필 */}
          <div className="">
            {profile.user.profileImage ? (
              <img
                src={profile.user.profileImage}
                alt="프로필 이미지"
                className="w-48 h-48 rounded-full border-4 border-white shadow-sm object-cover"
              />
            ) : (
              <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center">
                <UserRound className="w-24 h-24 text-gray-600" />
              </div>
            )}
          </div>
          {/**닉넴,팔로워,팔로잉,게시물,미트볼 */}
          <div className="flex flex-col h-44 p-6 gap-y-6 ">
            <h2 className="font-semibold text-2xl ">{profile.user.nickname}</h2>

            <div className="flex flex-row gap-5 ml-2">
              {isMyProfile ? (
                <button>프로필 편집</button>
              ) : (
                <>
                  {profile.relationship === "followedByMe" ? (
                    <button
                      className="group text-gray-50 text-xl ml-2 bg-blue-400 w-[150px] h-fit py-2 rounded-md shadow-md hover:bg-red-500 transition-colors"
                      onClick={() => {
                        //setRelationship("noRelationship");
                        unfollowUser(currentProfileId);
                      }}
                    >
                      <span className="group-hover:hidden">팔로우 중</span>

                      <span className="hidden group-hover:inline">
                        언팔로우
                      </span>
                    </button>
                  ) : (
                    <button
                      className="text-gray-50 text-xl ml-2 bg-blue-400 w-[150px] h-fit py-2 rounded-md shadow-md hover:bg-blue-500 transition-colors"
                      onClick={() => {
                        //  setRelationship("isFollowing");
                        followUser(currentProfileId);
                      }}
                    >
                      팔로우
                    </button>
                  )}
                </>
              )}

              <button className="">
                <Ellipsis size={32} />
              </button>
            </div>
            {/**게시물 팔로워 팔로잉 */}

            <div className="flex justify-evenly text-center text-lg">
              <div>
                <p className="text-gray-500">게시물</p>

                <p className="font-bold">{profile.postCount}</p>
              </div>
              <button>
                <p className="text-gray-500">팔로워</p>

                <p className="font-bold">{profile.followerCount}</p>
              </button>
              <button>
                <p className="text-gray-500">팔로잉</p>

                <p className="font-bold">{profile.followingCount}</p>
              </button>
            </div>
          </div>

          {/**뱃지 */}
          <button className="w-24 h-24  ml-auto rounded-full bg-rose-200 justify-center items-center grid">
            <Award
              className="text-rose-400 col-start-1 row-start-1"
              size={60}
            />
            <div className="font-bold text-4xl col-start-1 row-start-1 drop-shadow-md">
              {profile.achievedBadgeCount}
            </div>
          </button>
        </div>
        {/**바이오 */}
        <div className="p-4 pl-8">{profile.description}</div>
      </div>
      {/*게시글 내용 */}
      {profile.postCount === 0 ? (
        <div>아직 게시글이 없습니다</div>
      ) : (
        //유저가 작성한 포스팅만 가져오는 api 연결 필요
        <h>저 글 적었습니다 저 여기에 분명히 있어요.</h>
      )}
    </div>
  );
};

export default ProfilePage;
