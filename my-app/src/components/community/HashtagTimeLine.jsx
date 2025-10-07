//구독중인 해시태그 탐라

import React, { useState, useEffect } from "react";
import PostingStyle from "./PostingStyle";
import { usePost } from "../../hooks/usePost";
// MainTimeLine.jsx
const MainTimeLine = () => {
  const { posts, loading, error, getUserPostList } = usePost();

  useEffect(() => {
    getUserPostList(); // 팔로잉한 사람들의 게시물만 가져오기
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div>
      {posts.map((post) => (
        <PostingStyle key={post.postId} post={post} />
      ))}
    </div>
  );
};
export default MainTimeLine;
