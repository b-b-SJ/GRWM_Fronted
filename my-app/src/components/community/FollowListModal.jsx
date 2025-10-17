import React, { useState, useEffect } from "react";
import { X, UserRound } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { Link } from "react-router-dom";

const FollowListModal = ({
  mode,
  openFollowListModal,
  setOpenFollowListModal,
  targetId,
}) => {
  const [viewMode, setViewMode] = useState(mode);
  const { getFollowerList, getFollowingList } = useProfile();
  const [error, setError] = useState(null);
  const [userList, setUserList] = useState([]);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserList = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (viewMode === "follower") {
        result = await getFollowerList(targetId);
      } else {
        result = await getFollowingList(targetId);
      }

      console.log("가져온 목록:", result);

      if (result) {
        setUserList(result.users);
        setCount(result.count);
      }
    } catch (err) {
      console.error("목록 가져오기 실패:", err);
      setError("목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (openFollowListModal && targetId) {
      fetchUserList();
    }
  }, [viewMode, openFollowListModal, targetId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center ">
      <div className="bg-white p-6 rounded-lg max-w-xl w-full mx-4 max-h-[80vh] flex flex-col mb-40">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {viewMode === "follower" ? "팔로워" : "팔로잉"}
          </h2>
          <button
            className="hover:bg-gray-200 rounded-full p-2"
            onClick={() => setOpenFollowListModal(false)}
          >
            <X />
          </button>
        </div>

        {/* 탭 버튼 */}
        <div className="flex border-b mb-4">
          <button
            className={`flex-1 py-2 ${
              viewMode === "follower"
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("follower")}
          >
            팔로워
          </button>
          <button
            className={`flex-1 py-2 ${
              viewMode === "following"
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("following")}
          >
            팔로잉
          </button>
        </div>

        {/* 유저 리스트 */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : userList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {viewMode === "follower"
                ? "아직 팔로워가 없습니다"
                : "아직 팔로잉한 사람이 없습니다"}
            </div>
          ) : (
            <div className="space-y-2">
              {userList.map((user) => (
                <Link
                  key={user.communityId}
                  to={`/community/profile/${user.communityId}`}
                  onClick={() => setOpenFollowListModal(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {/* 프로필 이미지 */}
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.nickname}의 프로필`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 bg-gray-200 flex items-center justify-center">
                      <UserRound className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* 유저 정보 */}
                  <div className="flex-1">
                    <div className="font-semibold">{user.nickname}</div>
                    {user.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {user.description}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
