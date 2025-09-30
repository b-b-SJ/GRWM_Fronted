import { useCallback, useEffect, useState } from "react";
import { UserRound } from "lucide-react";

// 목업 데이터
const mockProfiles = [
  {
    User: {
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
    User: {
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
    User: {
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

const initialProfile = {
  User: {
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
const initialProfile1 = [
  {
    User: {
      communityId: "youyousangjong",
      nickName: "유유상종수",
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

export function useProfile() {
  const [profile, setProfile] = useState(null); //초기값.
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);

  //프로필정보 가져오기 -함수명들 내가 적은 명세 보고 해야하는 걸까..(모름)
  const getUserProfile = useCallback(async (communityId) => {
    //확인 필요

    setLoadingProfile(true);
    setError(null);

    try {
      const response = await fetch(`api/users/{userId}/profile`, {
        method: "GET",
        headers: {},
      });

      if (response.ok) {
        const profileInfo = await response.json();
        setProfile(profileInfo);
      } else {
        console.error("프로필 조회에 실패했습니다");
        setProfile(initialProfile);
      }
    } catch (error) {
      console.error("프로필 조회 에러", error);
      setProfile(initialProfile);
    } finally {
      setLoadingProfile(false);
    }
  }, []); //[]에는 뭐 넣어야하는 거지

  const updateUserProfile = useCallback(async (communityId, userData) => {
    //얘도 확인필요

    try {
      const requestData = {};
      const response = await fetch("", {
        method: "PUT",
        headers: {},
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "프로필 편집에 실패했습니다");
      }

      //편집 된 거 다시 가져와

      await getUserProfile();

      //신규 생성이면 아이디 같은 걸 줄텐데 그게 아니라면 뭘 주는?
    } catch (error) {
      console.error("프로필 편집 오류:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const createUserProfile = useCallback(async (userData) => {
    try {
      const requestData = {};
      const response = await fetch("", {
        method: "POST",
        headers: {},
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "프로필 생성에 실패했습니다");
      }

      await getUserProfile();
    } catch (error) {
      console.error("프로필 생성 오류:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // 목업 데이터로 테스트하는 함수 (개발용)
  const loadMockProfile = useCallback((communityId) => {
    const mockProfile = mockProfiles.find(
      (p) => p.User.communityId === communityId
    );
    if (mockProfile) {
      setProfile(mockProfile);
    } else {
      setProfile(initialProfile);
    }
  }, []);

  return {
    profile, // 단일 프로필로 변경
    getUserProfile,
    updateUserProfile,
    loadMockProfile, // 개발용 목업 로더
    error,
    loadingProfile,
  };
}
//유저 아이디는 string이 아니라 long
//구현 우선 순위!!! 프로필화면
//팔로잉 팔로우 로직 연결
//-> 포스팅 스크롤까지.
//포스팅 작성 같은 거는 나중에-> 프로필 편집+포스팅 작성 함께 진행 -> 이미지 업로드 기능
