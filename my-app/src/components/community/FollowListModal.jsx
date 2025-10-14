import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
const FollowListModal = ({
  mode,
  openFollowListModal,
  setOpenFollowListModal,
  targetId,
}) => {
  const [viewMode, setViewMode] = useState(mode);
  //각 팔로워, 팔로잉 리스트 반환
  const { getFollowerList, getFollowingList } = useProfile();
  const [error, setError] = useState(null);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserList = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (viewMode === "follower") {
        // 팔로워 목록 가져오기
        result = await getFollowerList(targetId);
      } else {
        // 팔로잉 목록 가져오기
        result = await getFollowingList(targetId);
      }

      console.log("가져온 목록:", result);

      // ✅ 3단계: 가져온 데이터를 state에 저장
      if (result) {
        setUserList(result); // 또는 result.users, result.data 등 (백엔드 응답 구조에 따라)
      }
    } catch (err) {
      console.error("목록 가져오기 실패:", err);
      setError("목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 4단계: 모달이 열리거나 viewMode가 바뀔 때 자동 실행
  useEffect(() => {
    if (openFollowListModal && targetId) {
      fetchUserList();
    }
  }, [viewMode, openFollowListModal, targetId]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-xl w-full mx-4 mb-16">
        <button
          className="hover:bg-gray-200 rounded-xl"
          onClick={() => setOpenFollowListModal(!openFollowListModal)}
        >
          <X />
        </button>
        <div className="flex  justify-center items-center gap-x-36 text-lg">
          <button
            className=" hover:bg-gray-300 px-3"
            onClick={() => setViewMode("follower")}
          >
            팔로워
          </button>

          <button
            className=" hover:bg-gray-300 px-3"
            onClick={() => setViewMode("following")}
          >
            팔로잉
          </button>
        </div>

        {viewMode === "follower" ? <h1></h1> : <h1>내가 팔로우하는</h1>}
      </div>
    </div>
  );
};
export default FollowListModal;
