// PostList.jsx - 완성본
import { useState, useEffect } from "react";
import { usePost } from "../../hooks/usePost";
import PostingStyle from "./PostingStyle";

const PostList = ({ posts, onPostsChange }) => {
  const { deletePost } = usePost();
  const [localPosts, setLocalPosts] = useState(posts);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  // props.posts 변경 감지
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handlePostDeleted = async (postId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        setDeletingPostId(postId); // 로딩 표시용
        const result = await deletePost(postId);

        if (result) {
          // 부모에게 알림
          if (onPostsChange) {
            onPostsChange(postId);
          }
          alert("삭제되었습니다.");
        } else {
          alert("삭제에 실패했습니다");
        }
      } catch (error) {
        console.error("삭제 오류:", error);
        alert("오류가 발생했습니다");
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  if (!localPosts || localPosts.length === 0) {
    return <div className="text-center py-8">게시물이 없습니다</div>;
  }

  return (
    <div>
      {localPosts.map((post) => (
        <PostingStyle
          key={post.postId}
          post={post}
          onDelete={handlePostDeleted}
          isDeleting={deletingPostId === post.postId}
          //onEdited={handleEdited}
        />
      ))}
    </div>
  );
};

export default PostList;
