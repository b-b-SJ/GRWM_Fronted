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

const initialProfile1 = {
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
const myProfile = {
  User: {
    communityId: "jkbearlover",
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
};

export function useProfile() {
  const [profile, setProfile] = useState(initialProfile); //초기값.
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);

  //프로필정보 가져오기 -함수명들 내가 적은 명세 보고 해야하는 걸까..(모름)
  const getUserProfile = useCallback(async (communityId) => {
    //확인 필요
    //loadMockProfile을 여기에 적용?하면 이게 테스트가 돌아갈지??
    setLoadingProfile(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/{userId}/profile`, {
        method: "GET",
        headers: { contentType: "application/json" },
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

  const getMyProfile = useCallback(async (communityId) => {
    //음?? 내 프로필에 대해서 추가적으로 작성할 코드는?
    //loadMockProfile을 여기에 적용?하면 이게 테스트가 돌아갈지??
    setLoadingProfile(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/me/profile`, {
        method: "GET",
        headers: { contentType: "application/json" },
      });

      if (response.ok) {
        const profileInfo = await response.json();
        setProfile(profileInfo);
      } else {
        console.error("프로필 조회에 실패했습니다");
        setProfile(myProfile); //크ㅡ앙
      }
    } catch (error) {
      console.error("프로필 조회 에러", error);
      setProfile(myProfile); //크-앙
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (communityId, userData) => {
    //얘도 확인필요

    try {
      const requestData = {};
      const response = await fetch(``, {
        method: "PUT",
        headers: {
          contentType: "application/json",
          //authorization, //본인일 경우에만 허용
        },
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
        headers: {
          contentType: "application/json",
        },
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

  const followUser = useCallback(
    async (communityId, targetId) => {
      try {
        const response = await fetch(`/api/users/${targetId}/follow`, {
          method: "POST",
          headers: {
            contentType: "application/json",
            //authorization도 필요한지?
          },
          body: null, //머가 들어가디?온즈오브 갤럭시 ㅇㅈㄹ
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "팔로우에 실패했습니다");
        } else {
          //팔로우 성공시 프로필 정보 다시 불러오기
          await getUserProfile(communityId);
        }
      } catch (error) {
        console.error("팔로우 오류:", error);
        setError(error.message);
        throw error;
      } finally {
        setLoadingProfile(false);
      }
    },
    [getUserProfile]
  );

  const unfollowUser = useCallback(
    async (communityId, targetId) => {
      try {
        const response = await fetch(`/api/users/${targetId}/follow`, {
          method: "DELETE",
          headers: { contentType: "application/json" },
          body: null,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "언팔로우에 실패했습니다");
        } else {
          await getUserProfile(communityId);
        }
      } catch (error) {
        console.error("언팔로우 오류", error);
        setError(error.message);
        throw error;
      } finally {
        setLoadingProfile(false);
      }
    },
    [getUserProfile]
  );

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
    myProfile,
    getUserProfile,
    updateUserProfile,
    loadMockProfile, // 개발용 목업 로더
    error,
    loadingProfile,
    followUser,
    unfollowUser,
    getMyProfile,
  };
}
//유저 아이디는 string이 아니라 long
//구현 우선 순위!!! 프로필화면
//팔로잉 팔로우 로직 연결
//-> 포스팅 스크롤까지.
//포스팅 작성 같은 거는 나중에-> 프로필 편집+포스팅 작성 함께 진행 -> 이미지 업로드 기능
