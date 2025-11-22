import { useCallback, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useAuth } from "./AuthContext";

//api 주소 상대 경로
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export function useProfile() {
  const { user, getAuthHeaders, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
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
          `${API_BASE_URL}/api/users/${communityId}/profile`,
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
      // 디버깅 시작
      console.log("=== 프로필 수정 디버깅 ===");
      console.log("communityId:", communityId);
      console.log("user.userId:", user.userId);
      console.log("같은지?:", communityId === user.userId);
      console.log("토큰:", localStorage.getItem("accessToken"));
      console.log("userData:", userData);

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

        const headers = getAuthHeaders();
        console.log("헤더:", headers);

        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(requestData),
        });

        console.log("응답 상태:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("에러 응답:", errorText);
          throw new Error(errorText || "프로필 편집에 실패했습니다");
        }

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
    [getUserProfile, getAuthHeaders, user]
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
          `${API_BASE_URL}/api/users/${targetId}/follow`,
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
          `${API_BASE_URL}/api/users/${targetId}/follow`,
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

  //팔로워 리스트
  const getFollowerList = useCallback(
    async (targetId) => {
      setError(null);
      setLoadingProfile(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/${targetId}/followers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("팔로워리스트 가져오기 성공", data);
          return data;
        }
      } catch (error) {
        console.error(" 팔로워리스트 조회 오류:", error);
        setError(error.message);
        throw error;
      } finally {
        setLoadingProfile(false);
      }
    },
    [getAuthHeaders]
  );
  //팔로잉 리스트
  const getFollowingList = useCallback(
    async (targetId) => {
      setError(null);
      setLoadingProfile(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/${targetId}/following`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("팔로잉리스트 가져오기 성공", data);
          return data;
        }
      } catch (error) {
        console.error(" 팔로잉리스트 조회 오류:", error);
        setError(error.message);
        throw error;
      } finally {
        setLoadingProfile(false);
      }
    },
    [getAuthHeaders]
  );
  const blockUser = useCallback(async (targetId) => {
    setLoadingProfile(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/blocks/${targetId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // 수정
            ...getAuthHeaders(),
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "팔로우에 실패했습니다");
      }

      // 팔로우 성공시 프로필 정보 다시 불러오기
      console.log("블락 성공");
      await getUserProfile(targetId);
    } catch (error) {
      console.error(" 블락 오류:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const unblockUser = useCallback(
    async (targetId) => {
      if (!targetId) {
        console.error("targetId가 필요합니다");
        return;
      }

      setLoadingProfile(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/blocks/${targetId}`,
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
          throw new Error(errorData.message || "언블락에 실패했습니다");
        }

        console.log("언블락 성공");
        await getUserProfile(targetId);
      } catch (error) {
        console.error("언블락 오류:", error);
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

    getUserProfile,
    //getMyProfile,
    updateUserProfile,
    //createUserProfile,
    followUser,
    unfollowUser,
    error,
    loadingProfile,
    blockUser,
    unblockUser,
    getFollowerList,
    getFollowingList,
  };
}
