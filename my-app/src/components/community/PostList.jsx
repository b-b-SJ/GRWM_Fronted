import { useState, useEffect } from "react";
import { usePost } from "../../hooks/usePost";
import PostingStyle from "./PostingStyle";

const PostList = ({ posts, onPostsChange }) => {
  const { deletePost } = usePost();
  const [localPosts, setLocalPosts] = useState(posts);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // props.posts 변경 시 localPosts 동기화
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // ✅ 삭제 처리
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

  // ✅ 수정 완료 처리
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
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">게시물이 없습니다</p>
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
        />
      ))}
    </div>
  );
};

export default PostList;
