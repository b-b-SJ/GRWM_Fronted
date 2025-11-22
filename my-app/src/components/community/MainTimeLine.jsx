import React, { useState, useEffect } from "react";
import { usePost } from "../../hooks/usePost";
import PostList from "./PostList";

const MainTimeLine = () => {
  const { posts, loading, error, getPostList } = usePost();

  useEffect(() => {
    const loadTimeLine = async () => {
      try {
        await getPostList();
      } catch (error) {
        console.error("타임라인 로드 실패:", error);
      }
    };
    loadTimeLine();
  }, []);

  // 변경 사항 있으면 재렌더
  const handlePostsChange = async (mode, data) => {
    console.log(`타임라인 게시물 ${mode}됨:`, data);

    // create나 delete는 목록 새로고침
    if (mode === "create" || mode === "delete") {
      await getPostList();
    }
    // edit는 PostList가 이미 처리함
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-500">에러: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <PostList
        posts={posts?.postList || []}
        onPostsChange={handlePostsChange} // ✅ 콜백 전달
      />
    </div>
  );
};

export default MainTimeLine;
