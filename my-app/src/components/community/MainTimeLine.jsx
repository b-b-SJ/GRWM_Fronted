//메인 탐라
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePost } from "../../hooks/usePost";
import PostList from "./PostList";
// MainTimeLine.jsx
const MainTimeLine = () => {
  const { posts, loading, error, getPostList } = usePost();

  useEffect(() => {
    const loadTimeLine = async () => {
      try {
        await getPostList();
        console.log(posts);
      } catch (error) {
        alert("탐라 못 불러오겟서영");
      }
    };
    loadTimeLine();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  console.log("main:", posts);
  return (
    <div>
      <PostList posts={posts.postList} />
    </div>
  );
};

export default MainTimeLine;
