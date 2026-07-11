import { useCallback, useState } from "react";
import { useAuth } from "./AuthContext";

export function useHashtag() {
  const { getAuthHeaders } = useAuth();
  const [subscribed, setSubscribed] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hashtagList, setHashtagList] = useState([]);
  const [hashtagPosts, setHashtagPosts] = useState(null); //hasMore도 같이 옴

  //api 주소 상대 경로
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  // ✅ keyword로 해시태그 ID 조회
  const getHashtagIdByKeyword = useCallback(
    async (keyword) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/hashtag?keyword=${encodeURIComponent(keyword)}`,
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
          console.log("해시태그 ID 조회 성공:", data);
          return data;
        } else {
          console.error("해시태그 ID 조회 실패:", response.status);
          setError("해시태그 정보를 가져올 수 없습니다");
          return null;
        }
      } catch (error) {
        console.error("해시태그 ID 조회 에러:", error);
        setError("네트워크 에러가 발생했습니다");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  //해시태그 구독
  const subscribeHashtag = useCallback(
    async (userId, tagId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/${userId}/subscribed-hashtags/${tagId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        if (response.ok) {
          console.log("해시태그 구독 성공");
          return true;
        } else {
          console.error(" 해시태그 구독 실패:", response.status);
          setError("해시태그 구독 실패했습니다");
          return false;
        }
      } catch (error) {
        console.error(" 해시태그 구독 에러:", error);
        setError("네트워크 에러가 발생했습니다");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  //구독 해제
  const unsubscribeHashtag = useCallback(
    async (tagId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/subscribed-hashtags/${tagId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        if (response.ok) {
          console.log("해시태그 구독 취소 성공");
        } else {
          console.error(" 해시태그 구독 취소 실패:", response.status);
          setError("해시태그 구독 취소 실패했습니다");
        }
      } catch (error) {
        console.error(" 해시태그 구독 취소 에러:", error);
        setError("네트워크 에러가 발생했습니다");
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  //구독 해시태그 포스트 리스트
  const getSubscribedHashtagPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/subscribed-hashtags/posts`,
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
        console.log("해시태그 글 불러오기 성공", data);
        setHashtagPosts(data);
      } else {
        console.error("해시태그 글 반환 실패:", response.status);
        setError("해시태그 글 반환을 실패했어요");
      }
    } catch (error) {
      console.error(" 에러:", error);
      setError("네트워크 에러가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  //구독중 해시태그들
  const getSubscribedHashtags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/subscribed-hashtags`,
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
        console.log("구독 중인 해시태그 반환 성공", data);
        setHashtagList(data);
      } else {
        console.error("구독 중인 해시태그 반환 실패:", response.status);
        setError("구독 중인 해시태그 반환을 실패했어요");
      }
    } catch (error) {
      console.error(" 에러:", error);
      setError("네트워크 에러가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  return {
    loading,
    error,
    subscribed,
    subscribeHashtag,
    unsubscribeHashtag,
    getSubscribedHashtags,
    hashtagList,
    getSubscribedHashtagPosts,
    hashtagPosts,
    getHashtagIdByKeyword,
  };
}
