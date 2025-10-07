import { useCallback, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useAuth } from "./AuthContext";
// 목업 데이터
const mockProfiles = [
  {
    user: {
      communityId: "gilgyu",
      nickName: "길규",
      profileImage:
        "https://chiikawamarket.jp/cdn/shop/files/4979432079006_4.jpg?v=1733821593&width=1445",
    },
    description: "할머니한테 할을 뺏으면 그냥 머니, 머니머니해도 난 외할머니",
    bannerImage:
      "https://i.pinimg.com/736x/74/57/b5/7457b5852852da55b03570eef8253722.jpg",
    postCount: 0,
    followerCount: 0,
    followingCount: 0,
    achievedBadgeCount: 0,
    pinnedPostId: null,
  },
  {
    user: {
      communityId: "gyudong",
      nickName: "규동 먹고 싶다",
      profileImage:
        "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/4686a67d2f6e39e1899d1e2afaff26ee1.jpg",
    },
    description:
      "규동은 한국어로 일본식 소고기덮밥, 제 고정 게시물 확인하시고 자격증 정보도 얻어가세요^^",
    bannerImage:
      "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/7f00d49c3ed49e8b773aecb4c4795a931.jpg",
    postCount: 1,
    followerCount: 0,
    followingCount: 0,
    achievedBadgeCount: 0,
    pinnedPostId: "21",
  },
  {
    user: {
      communityId: "youyousangjong",
      nickName: "유유상종",
      profileImage:
        "https://i.ibb.co/FbWvz1bB/2025030118134100-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
    },
    description:
      "안냥하세여, 저는 글라햄이구 동물의 숲 주민이에여..저는 느끼주민인데여...디게디게 기여우여ㅎㅎ",
    bannerImage:
      "https://static0.srcdn.com/wordpress/wp-content/uploads/2022/08/Every-Animal-Crossing-Villager-With-An-In-Game-Family.jpg",
    postCount: 1,
    followerCount: 0,
    followingCount: 0,
    achievedBadgeCount: 0,
    pinnedPostId: null,
  },
];

const initialProfile1 = {
  user: {
    communityId: "gangganggang",
    nickName: "걍가라123",
    profileImage:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRma0qHwnrmZJGctiNBnYrEDpPttke-V5Ru4A&s",
  },
  description: null,
  bannerImage:
    "https://s7d9.scene7.com/is/image/daltile/AO_MN44_24x24_Gray_Polished?$PRODUCTIMAGE$",
  postCount: 0,
  followerCount: 0,
  followingCount: 0,
  achievedBadgeCount: 0,
  pinnedPostId: null,
};
const myProfile = {
  user: {
    communityId: 1,
    nickName: "농담곰러버",
    profileImage:
      "https://mblogthumb-phinf.pstatic.net/MjAyMDA1MjZfMjUg/MDAxNTkwNDcxNzQ0NTUx.wLUx0ICJSHhE7CU5CAsa3tPPMkvfa76-XFNgkT5kPJYg.4I4B907z3cE2B6UhRUpCfdgbXuSiSh8muyX-pjQlhfgg.JPEG.cho980827/1590471744738.jpg?type=w800",
  },
  description: "왜 이리 세상이 나에게 가혹해..혹혹ㅠㅠ",
  bannerImage:
    "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FZDKg6%2FbtsKZ1lc62r%2FAAAAAAAAAAAAAAAAAAAAAGGkSeyKprTHrP9Ii1vQ8G6-QJoYrZjh7luoyRbcBr0m%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1759244399%26allow_ip%3D%26allow_referer%3D%26signature%3DMBHbZOaCyrSO%252Fm3I%252BH2PfBFvyIk%253D",
  postCount: 0,
  followerCount: 0,
  followingCount: 0,
  achievedBadgeCount: 0,
  pinnedPostId: null,
};
const initialProfile = {
  user: {
    communityId: 0,
    nickname: "유유상종수",
    profileImage:
      "https://i.ibb.co/FbWvz1bB/2025030118134100-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
  },
  description:
    "안냥하세여, 저는 글라햄이구 동물의 숲 주민이에여..저는 느끼주민인데여...디게디게 기여우여ㅎㅎ",
  bannerImage:
    "https://static0.srcdn.com/wordpress/wp-content/uploads/2022/08/Every-Animal-Crossing-Villager-With-An-In-Game-Family.jpg",
  postCount: 1,
  followerCount: 0,
  followingCount: 0,
  achievedBadgeCount: 0,
  pinnedPostId: null,
};

export function useProfile() {
  const { user, getAuthHeaders, isAuthenticated } = useAuth();
  const communityId = user.userId;
  console.log("오시는지?", communityId, user);
  const [profile, setProfile] = useState(initialProfile);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);
  const headers = getAuthHeaders();

  //프로필 조회
  const getUserProfile = useCallback(
    async (communityId) => {
      if (!communityId) {
        console.error("communityId가 필요합니다");
        return;
      }

      setLoadingProfile(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8080/api/users/${communityId}/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
          }
        );

        if (response.ok) {
          const profileInfo = await response.json();
          setProfile(profileInfo);
          console.log("프로필 조회 성공:", profileInfo);
        } else {
          console.error("프로필 조회 실패:", response.status);
          setError("프로필 조회에 실패했습니다");
          setProfile(null);
        }
        console.log("응답:", response.status);
      } catch (error) {
        console.error("프로필 조회 에러:", error);
        setError(error.message);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    },
    [getAuthHeaders]
  );

  //프로필 수정
  const updateUserProfile = useCallback(
    async (communityId, userData) => {
      if (!communityId || !userData) {
        console.error("communityId와 userData가 필요합니다");
        return;
      }

      setLoadingProfile(true);
      setError(null);

      try {
        const requestData = {
          nickname: userData.nickname,
          description: userData.description,
          profileImage: userData.profileImage,
          bannerImage: userData.bannerImage,
        };

        const response = await fetch(
          `http://localhost:8080/api/users/${communityId}/profile`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json", // 수정
              ...getAuthHeaders(),
            },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "프로필 편집에 실패했습니다");
        }

        // 수정 후 다시 프로필 가져오기
        await getUserProfile(communityId);
        console.log("프로필 수정 성공");
      } catch (error) {
        console.error("프로필 편집 오류:", error);
        setError(error.message);
        throw error;
      } finally {
        setLoadingProfile(false);
      }
    },
    [getUserProfile, getAuthHeaders]
  );

  // 프로필 생성
  const createUserProfile = useCallback(
    async (userData) => {
      setLoadingProfile(true);
      setError(null);

      try {
        const requestData = {
          nickname: userData.nickname,
          description: userData.description,
          profileImage: userData.profileImage,
          bannerImage: userData.bannerImage,
        };

        const response = await fetch(
          `http://localhost:8080/api/users/profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // 수정
              ...getAuthHeaders(),
            },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "프로필 생성에 실패했습니다");
        }

        const newProfile = await response.json();
        setProfile(newProfile);
        console.log("프로필 생성 성공:", newProfile);
      } catch (error) {
        console.error("프로필 생성 오류:", error);
        setError(error.message);
        throw error;
      } finally {
        setLoadingProfile(false);
      }
    },
    [getAuthHeaders]
  );

  // 팔로우
  const followUser = useCallback(
    async (targetId) => {
      if (!targetId) {
        console.error("targetId가 필요합니다");
        return;
      }

      setLoadingProfile(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8080/api/users/${targetId}/follow`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "팔로우에 실패했습니다");
        }

        // 팔로우 성공시 프로필 정보 다시 불러오기
        console.log("팔로우 성공");
        await getUserProfile(targetId);
      } catch (error) {
        console.error(" 팔로우 오류:", error);
        setError(error.message);
        throw error;
      } finally {
        setLoadingProfile(false);
      }
    },
    [getUserProfile, getAuthHeaders]
  );

  //언팔로우
  const unfollowUser = useCallback(
    async (targetId) => {
      if (!targetId) {
        console.error("targetId가 필요합니다");
        return;
      }

      setLoadingProfile(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8080/api/users/${targetId}/follow`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json", // 수정
              ...getAuthHeaders(),
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "언팔로우에 실패했습니다");
        }

        console.log("언팔로우 성공");
        await getUserProfile(targetId);
      } catch (error) {
        console.error("언팔로우 오류:", error);
        setError(error.message);
        throw error;
      } finally {
        setLoadingProfile(false);
      }
    },
    [getUserProfile, getAuthHeaders]
  );

  return {
    profile,
    myProfile, // 목업 데이터
    getUserProfile,
    //getMyProfile,
    updateUserProfile,
    createUserProfile,
    followUser,
    unfollowUser,
    error,
    loadingProfile,
  };
}
