import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import PostingStyle from "../../community/PostingStyle";
import CommentSection from "../../community/CommentSection";
import { usePost } from "../../../hooks/usePost";

const DetailedPostPage = () => {
  const { postId } = useParams(); //URL에서 postId 가져오기
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const { showPostDetail, deletePost, likePost, cancelLike } = usePost();

  // 게시물 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("가져올 postId:", postId);
        const data = await showPostDetail(postId);

        console.log("받은 데이터:", data);

        if (data) {
          setPost(data);
        } else {
          setError("게시물을 불러올 수 없습니다");
        }
      } catch (err) {
        console.error("에러:", err);
        setError("네트워크 에러가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, showPostDetail]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다</div>;

  // 삭제 처리
  const handlePostDeleted = async (postId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        setDeletingPostId(postId);
        await deletePost(postId);

        // 로컬에서 즉시 제거
        setPost(post.postId !== postId);
      } catch (error) {
        console.error("삭제 오류:", error);
        alert("삭제에 실패했습니다");
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const updatedLikeCount = await likePost(postId);

      // 화면 업뎃
      if (updatedLikeCount !== undefined) {
        setPost(
          post.postId === postId
            ? { ...post, likeCount: updatedLikeCount }
            : post
        );
      }
    } catch (error) {
      console.error("좋아요 오류:", error);
    }
  };

  const handleCancelLike = async (postId) => {
    try {
      const updatedLikeCount = await cancelLike(postId);

      // 화면 업뎃
      if (updatedLikeCount !== undefined) {
        setPost(
          post.postId === postId
            ? { ...post, likeCount: updatedLikeCount }
            : post
        );
      }
    } catch (error) {
      console.error("좋아요 취소 오류:", error);
    }
  };
  // 수정 완료 처리
  const handlePostChanged = (mode, updatedPost) => {
    console.log("게시물 변경:", mode, updatedPost);

    if (mode === "edit") {
      // 로컬 상태 업데이트
      setPost(post.postId === updatedPost.postId ? updatedPost : post);
    }

    // 부모에게 알림
  };
  return (
    <div>
      {/* 기존 PostingStyle 재사용 */}
      <PostingStyle
        post={post}
        onDelete={handlePostDeleted}
        onPostChanged={handlePostChanged}
        isDeleting={deletingPostId === post.postId}
        likePost={handleLikePost}
        cancelLike={handleCancelLike}
      />

      {/* 여기에 댓글 컴포넌트 추가 */}
      <CommentSection
        postId={post.postId}
        postAuthorId={post.user?.communityId}
      />
    </div>
  );
};

export default DetailedPostPage;
