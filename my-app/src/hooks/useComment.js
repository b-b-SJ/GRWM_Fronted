import { useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
export function useComment() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAuthHeaders } = useAuth();
  //댓글 생성
  const createComment = useCallback(
    async (postId, commentData) => {
      setLoading(true);
      setError(null);
      console.log("commentData:", commentData);
      console.log("JSON:", JSON.stringify(commentData)); // 실제 전송 데이터
      try {
        const response = await fetch(
          `/api/community-posts/${postId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify(commentData),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("받은 댓글 데이터:", data);
          console.log("생성된 댓글의 private 값:", data.private);
          if (Array.isArray(data)) {
            setComments(data);
          } else {
            console.warn("⚠️ 배열이 아님:", data);
            setComments([]);
          }

          console.log("댓글 반환 성공");
          return data;
        }
      } catch (error) {
        console.error("에러:", error);
        setError("네트워크 에러가 발생했습니다");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  //댓글 삭제
  const deleteComment = useCallback(async (postId, commentId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/community-posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (response.ok) {
        console.log("댓글 삭제 성공");
        return true;
      } else {
        console.error("댓글 삭제 실패:", response.status);
        setError("댓글 삭제를 실패했어요");
      }
    } catch (error) {
      console.error(" 에러:", error);
      setError("네트워크 에러가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  //댓글 수정
  const updateComment = useCallback(async (postId, commentId, commentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/community-posts/${postId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(commentData),
        }
      );

      if (response.ok) {
        const updatedComment = await response.json();

        console.log("댓글 수정 성공");
        return updatedComment;
      } else {
        console.error(" 댓글 수정 실패:", response.status);
        setError("댓글 수정에 실패했습니다");
      }
    } catch (error) {
      console.error(" 댓글 수정 에러:", error);
      setError("네트워크 에러가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  //댓글 리스트 반환
  // useComment.js의 getCommentList
  const getCommentList = useCallback(
    async (postId) => {
      setLoading(true);
      setError(null);

      try {
        const url = `/api/community-posts/${postId}/comments`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data)) {
            console.log("setComments 호출:", data);
            return data; // 배열 반환
          } else {
            console.warn("배열이 아님:", data);
            return []; // 빈 배열 반환
          }
        } else {
          // 에러 응답 내용 확인
          const errorText = await response.text();
          console.error("댓글 반환 실패:", response.status);
          console.error("에러 내용:", errorText);
          setError("댓글 반환을 실패했어요");
          return []; // 빈 배열 반환
        }
      } catch (error) {
        console.error("에러 발생:", error);
        console.error("에러 메시지:", error.message);
        setError("네트워크 에러가 발생했습니다");
        return []; // 빈 배열 반환
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  return {
    comments,
    loading,
    error,
    createComment,
    getCommentList,
    deleteComment,
    updateComment,
  };
}
