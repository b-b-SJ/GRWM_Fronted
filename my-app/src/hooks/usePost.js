import React, { useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export function usePost() {
  const { getAuthHeaders } = useAuth();
  const [posts, setPosts] = useState(null);
  const [likedUsers, setLikedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  //api 주소 상대 경로
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  //기본 타임라인에 뜰 게시글 부르는 거
  const getPostList = useCallback(
    async (page = 0, size = 30) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/community-posts?page=${page}&size=${size}`,
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
          setPosts(data);

          console.log("게시물 목록 조회 성공", data);
        } else {
          console.error(" 게시물 목록 조회 실패:", response.status);
          setError("게시물을 불러오는데 실패했습니다");
        }
      } catch (error) {
        console.error(" 게시물 목록 조회 에러:", error);
        setError("네트워크 에러가 발생했습니다");
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const createPost = useCallback(
    async (postData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/community-posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(postData),
        });
        if (response.ok) {
          const newPost = await response.json();

          console.log("게시글 업로드 성공:", newPost);
          return newPost;
        } else {
          console.error("게시글 업로드에 실패했습니다");
        }
      } catch (error) {
        console.error("포스팅 업로드 에러", error);
      } finally {
      }
    },
    [getAuthHeaders]
  );

  const showPostDetail = useCallback(
    async (postId) => {
      if (!postId) {
        console.error("postId 필요합니다");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/community-posts/${postId}`,
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
          console.log("디테일", data);
          return data;
        } else {
          console.error("게시글 조회에 실패했습니다");
          return null;
        }
      } catch (error) {
        console.error("포스팅 조회 에러", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getUserPosts = useCallback(
    async (communityId, page = 0, size = 30) => {
      if (!communityId) {
        console.error("communityId 필요합니다");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/community-posts/user/${communityId}?page=${page}&size=${size}`,
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
          console.log("무슨 글을 썻는교", data);
          setPosts(data.postList);
        } else {
          console.error("게시글 조회에 실패했습니다");
        }
      } catch (error) {
        console.error("타임라인 조회 에러", error);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const updatePost = useCallback(
    async (postId, postData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/community-posts/${postId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify(postData),
          }
        );

        if (response.ok) {
          const updatedPost = await response.json();

          return updatedPost;
        } else {
          const errorText = await response.text();
          console.error("게시글 수정 실패:", response.status, errorText);
          setError("게시글 수정에 실패했습니다");
          return null;
        }
      } catch (error) {
        console.error("게시글 수정 에러:", error);
        setError("네트워크 에러가 발생했습니다");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // 게시물 삭제
  const deletePost = useCallback(
    async (postId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/community-posts/${postId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        if (response.ok) {
          console.log("게시글 삭제 성공");
          return true;
        } else {
          console.error(" 게시글 삭제 실패:", response.status);
          setError("게시글 삭제에 실패했습니다");
          return false;
        }
      } catch (error) {
        console.error(" 게시글 삭제 에러:", error);
        setError("네트워크 에러가 발생했습니다");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const likePost = useCallback(
    async (postId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/community-posts/${postId}/like`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        if (response.ok) {
          const likeCount = await response.json();
          console.log("좋아요 성공", likeCount);
          return likeCount;
        } else {
          console.error(" 좋아요 실패:", response.status);
          setError("좋아요를 실패했어요");
        }
      } catch (error) {
        console.error(" 에러:", error);
        setError("네트워크 에러가 발생했습니다");
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const cancelLike = useCallback(
    async (postId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/community-posts/${postId}/like`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        if (response.ok) {
          const likeCount = await response.json();
          console.log("좋아요 취소 성공");
          return likeCount;
        } else {
          console.error(" 좋아요 취소 실패:", response.status);
          setError("좋아요 취소를 실패했어요");
        }
      } catch (error) {
        console.error(" 에러:", error);
        setError("네트워크 에러가 발생했습니다");
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const getPostLikedUserList = useCallback(
    async (postId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/community-posts/${postId}/likes`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );
        if (response.ok) {
          const likes = response.json();
          console.log("좋아요한 유저 반환 성공");
          setLikedUsers(likes);
        } else {
          console.error(" 좋아요 유저 반환 실패:", response.status);
          setError("좋아요한 유저 반환을 실패했어요");
        }
      } catch (error) {
        console.error(" 에러:", error);
        setError("네트워크 에러가 발생했습니다");
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  return {
    posts,
    loading,
    error,
    getPostList,
    getUserPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    cancelLike,
    getPostLikedUserList,
    showPostDetail,
  };
}
