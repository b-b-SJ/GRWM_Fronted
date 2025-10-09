//메인 탐라
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePost } from "../../hooks/usePost";
import PostingStyle from "./PostingStyle";
// MainTimeLine.jsx
const MainTimeLine = () => {
  const { posts, loading, error } = usePost();

  useEffect(() => {
    //timeLine posts 글들을 api를 통해 불러옴
    // 팔로잉한 사람들+본인의 게시물만 가져오기
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  console.log("main:", posts);
  return (
    <div>
      {posts.map(
        (post) => (
          console.log("제대로 가고 있니?", post),
          (<PostingStyle key={post.postId} post={post} />)
        )
      )}
    </div>
  );
};

export default MainTimeLine;
