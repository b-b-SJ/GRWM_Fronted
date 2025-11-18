import { useState, useEffect } from "react";
import { usePost } from "../../hooks/usePost";
import PostingStyle from "./PostingStyle";
import { PenLine } from "lucide-react";
const PostList = ({ posts, onPostsChange }) => {
  const { deletePost, likePost, cancelLike } = usePost();
  const [localPosts, setLocalPosts] = useState(posts);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // props.posts 변경 시 localPosts 동기화
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // 삭제 처리
  const handlePostDeleted = async (postId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        setDeletingPostId(postId);
        await deletePost(postId);

        // 로컬에서 즉시 제거
        setLocalPosts((prev) => prev.filter((post) => post.postId !== postId));

        // 부모에게 알림
        if (onPostsChange) {
          onPostsChange("delete", postId);
        }
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
        setLocalPosts((prev) =>
          prev.map((post) =>
            post.postId === postId
              ? { ...post, likeCount: updatedLikeCount }
              : post
          )
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
        setLocalPosts((prev) =>
          prev.map((post) =>
            post.postId === postId
              ? { ...post, likeCount: updatedLikeCount }
              : post
          )
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
      setLocalPosts((prev) =>
        prev.map((post) =>
          post.postId === updatedPost.postId ? updatedPost : post
        )
      );
    }

    // 부모에게 알림
    if (onPostsChange) {
      onPostsChange(mode, updatedPost);
    }
  };

  if (!localPosts || localPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PenLine />
          </div>
          <p className="text-lg text-gray-600 mb-2">아직 게시물이 없습니다</p>
          <p className="text-sm text-gray-500">
            새로운 사람을 팔로우하거나 글을 작성해보세요
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      {localPosts.map((post) => (
        <PostingStyle
          key={post.postId}
          post={post}
          onDelete={handlePostDeleted}
          onPostChanged={handlePostChanged}
          isDeleting={deletingPostId === post.postId}
          likePost={handleLikePost}
          cancelLike={handleCancelLike}
        />
      ))}
    </div>
  );
};

export default PostList;
