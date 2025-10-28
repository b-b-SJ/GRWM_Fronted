import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
export function useCommunitySearch() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(null);
  const { getAuthHeaders } = useAuth();
  {
    /**
searchHashtag 
requestParam keyword(#없이 보내주세요) 
Response: {List<Post> posts, boolean hasMore} 

searchUser 
requestParam keyword 
Response: {List<User> users, int totalCount, boolean hasMore} 

searchPost 
requestParam keyword 
Response: {List<Post> posts, int totalCount, boolean hasMore}
     */
  }
  const searchHashtag = useCallback(
    async (keyword, page = 0, size = 30) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8080/api/search/hashtags?keyword=${encodeURIComponent(
            keyword
          )}&page=${page}&size=${size}`,
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
          setSearched(data);
          console.log("해시태그 검색 성공", data);
          return data;
        } else {
          console.log("해시태그 검색 실패:", response.status);
          setError("해시태그 검색에 실패했습니다");
          return null;
        }
      } catch (error) {
        console.error("해시태그 검색 에러:", error);
        setError("네트워크 에러가 발생했습니다");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const searchUser = useCallback(
    async (keyword, page = 0, size = 30) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/search/users?keyword=${encodeURIComponent(
            keyword
          )}&page=${page}&size=${size}`,
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
          setSearched(data);
          console.log("유저 검색 성공", data);
          return data;
        } else {
          console.log("유저 검색 실패:", response.status);
          setError("유저 검색에 실패했습니다");
          return null;
        }
      } catch (error) {
        console.error("유저 검색 에러:", error);
        setError("네트워크 에러가 발생했습니다");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const searchPost = useCallback(
    async (keyword, page = 0, size = 30) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/search/posts?keyword=${encodeURIComponent(
            keyword
          )}&page=${page}&size=${size}`,
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
          setSearched(data);
          console.log("게시글 검색 성공", data);
          return data;
        } else {
          console.log("게시글 검색 실패:", response.status);
          setError("게시글 검색에 실패했습니다");
          return null;
        }
      } catch (error) {
        console.error("게시글 검색 에러:", error);
        setError("네트워크 에러가 발생했습니다");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  return {
    searchPost,
    searchUser,
    searchHashtag,
    searched, // 검색 결과도 함께 반환
    loading, // 로딩 상태도 반환
    error, // 에러도 반환
  };
}
