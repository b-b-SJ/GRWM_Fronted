//구독중인 해시태그 탐라
import React, { useState, useEffect } from "react";
import PostList from "./PostList";
import { useHashtag } from "../../hooks/useHashtag";
import { Tag } from "lucide-react";
const HashtagTimeLine = () => {
  const { getSubscribedHashtagPosts, hashtagPosts, loading, error } =
    useHashtag();

  // 구독 해시태그 게시물 불러오기
  useEffect(() => {
    const loadHashtagPosts = async () => {
      try {
        await getSubscribedHashtagPosts();
      } catch (error) {
        console.error("구독 해시태그 게시물 로드 실패:", error);
      }
    };

    loadHashtagPosts();
  }, []);

  // ✅ 게시물 변경 핸들러
  const handlePostsChange = async (mode, data) => {
    console.log(`해시태그 타임라인 게시물 ${mode}됨:`, data);

    // create나 delete는 목록 새로고침
    if (mode === "create" || mode === "delete") {
      await getSubscribedHashtagPosts();
    }
    // edit는 PostList가 이미 처리
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-500">에러: {error}</div>
      </div>
    );
  }

  // 구독한 해시태그가 없거나 게시물이 없을 때
  if (!hashtagPosts || hashtagPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag />
          </div>
          <p className="text-lg text-gray-600 mb-2">
            구독 중인 해시태그의 게시물이 없습니다
          </p>
          <p className="text-sm text-gray-500">
            관심있는 해시태그를 구독해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PostList posts={hashtagPosts || []} onPostsChange={handlePostsChange} />
    </div>
  );
};

export default HashtagTimeLine;
