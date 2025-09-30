import React from "react";
import { useState } from "react"; // useEffect는 훅 안으로 이동했으므로 제거 가능
import { useNavigate } from "react-router-dom";
import { UserRound, Ellipsis, Award } from "lucide-react";
import { useProfile } from "../../../hooks/useProfile"; // 새로운 훅 import
//import NoPosting from "../../community/NoPosting";

// MyProfilePage는 props를 받지 않습니다.
const MyProfilePage = () => {
  const [follow, setFollow] = useState(false); // 팔로우 버튼은 내 프로필에선 다른 UI가 될 수 있습니다 (예: 프로필 수정 버튼)
  const navigate = useNavigate();

  // 1. 새로운 훅을 사용합니다. 인자가 필요 없습니다.
  const { myProfile, loading, error } = useProfile();

  // 2. 컴포넌트 내 useEffect는 더 이상 필요 없습니다.

  // 로딩, 에러, 빈 상태 처리
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!myProfile) return <div>프로필을 찾을 수 없습니다.</div>;

  // 3. 'profile'을 모두 'myProfile'로 변경해줍니다.
  return (
    <div className=" bg-white ">
      <div className=" shadow-md">
        <div className="max-w-full aspect-[32/2]">
          <img
            src={myProfile.bannerImage}
            alt="배너 이미지"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-7 px-6 py-4 flex pb-12 border-b">
          {/**프필 */}
          <div className="">
            {myProfile.User.profileImage ? (
              <img
                src={myProfile.User.profileImage}
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
            <h2 className="font-semibold text-2xl ">
              {myProfile.User.nickName}
            </h2>

            <div className="flex flex-row gap-5 ml-2">
              <button
                className="group text-gray-700 text-xl ml-2 bg-gray-300 w-[150px] h-fit py-2 rounded-md shadow-md hover:bg-gray-400 transition-colors"
                onClick={() => setFollow(!follow)}
              >
                프로필 편집
              </button>

              <button className="">
                <Ellipsis size={32} />
              </button>
            </div>
            {/**게시물 팔로워 팔로잉 */}

            <div className="flex justify-evenly text-center text-lg">
              <div>
                <p className="text-gray-500">게시물</p>

                <p className="font-bold">{myProfile.postCount}</p>
              </div>
              <button>
                <p className="text-gray-500">팔로워</p>

                <p className="font-bold">{myProfile.followerCount}</p>
              </button>
              <button>
                <p className="text-gray-500">팔로잉</p>

                <p className="font-bold">{myProfile.followingCount}</p>
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
              {myProfile.achievedBadgeCount}
            </div>
          </button>
        </div>
        {/**바이오 */}
        <div className="p-4 pl-8">{myProfile.description}</div>
      </div>
      {/*게시글 내용 */}
      <h1 className="py-48 flex justify-center items-center">
        아직 게시글이 없습니다
      </h1>
    </div>
  );
};

export default MyProfilePage;
