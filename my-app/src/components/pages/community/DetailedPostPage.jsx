import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import PostingStyle from "../../community/PostingStyle";
import CommentSection from "../../community/CommentSection";
import { usePost } from "../../../hooks/usePost";

const DetailedPostPage = () => {
  const { postId } = useParams(); // ⭐ URL에서 postId 가져오기
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { showPostDetail } = usePost();

  // 게시물 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null); // ⭐ 추가

      try {
        console.log("가져올 postId:", postId); // ⭐ 디버깅
        const data = await showPostDetail(postId); // ⭐ 응답 받기

        console.log("받은 데이터:", data); // ⭐ 디버깅

        if (data) {
          setPost(data); // ⭐ post에 저장
        } else {
          setError("게시물을 불러올 수 없습니다");
        }
      } catch (err) {
        console.error("에러:", err); // ⭐ 디버깅
        setError("네트워크 에러가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      // ⭐ postId가 있을 때만 실행
      fetchPost();
    }
  }, [postId, showPostDetail]); // ⭐ 의존성 배열 수정

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다</div>;

  return (
    <div>
      {/* 기존 PostingStyle 재사용 */}
      <PostingStyle post={post} />

      {/* 여기에 댓글 컴포넌트 추가 */}
      <CommentSection postId={postId} />
    </div>
  );
};

export default DetailedPostPage;
