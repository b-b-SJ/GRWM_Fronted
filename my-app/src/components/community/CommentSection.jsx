import React, { useState, useEffect } from "react";
import { useComment } from "../../hooks/useComment";
import CommentItem from "./CommentItem";

const CommentSection = ({ postId, postAuthorId }) => {
  const {
    loading,
    error,
    createComment,
    deleteComment,
    updateComment,
    getCommentList,
  } = useComment();

  // 로컬 state로 댓글 관리
  const [localComments, setLocalComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // 댓글 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      if (postId) {
        console.log("getCommentList 호출");
        const data = await getCommentList(postId);
        console.log("받은 데이터:", data);

        if (data) {
          setLocalComments(data);
          console.log("localComments 업데이트:", data);
        }
      }
    };
    fetchComments();
  }, [postId, getCommentList]);

  // 댓글 작성
  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요");
      return;
    }

    const result = await createComment(postId, {
      content: newComment,
      private: isPrivate,
    });

    if (result) {
      setNewComment("");
      setIsPrivate(false);

      //  댓글 목록 다시 불러오기
      const data = await getCommentList(postId);
      if (data) {
        setLocalComments(data);
      }
    }
  };

  // 댓글 수정
  const handleUpdateComment = async (commentId, content, isPrivate) => {
    const result = await updateComment(postId, commentId, {
      content: content,
      private: isPrivate,
    });

    if (result) {
      const data = await getCommentList(postId);
      if (data) {
        setLocalComments(data);
      }
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("댓글을 삭제할까요?")) {
      const result = await deleteComment(postId, commentId);

      if (result) {
        const data = await getCommentList(postId);
        if (data) {
          setLocalComments(data);
        }
      }
    }
  };

  if (loading) {
    return <div className="p-6">댓글 로딩 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">에러: {error}</div>;
  }

  return (
    <div className="p-6 border-t bg-white">
      {/* 댓글 작성 */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
          rows={3}
        />

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="isPrivate" className="text-sm text-gray-600">
            비공개 댓글
          </label>
          <button
            onClick={handleCreateComment}
            className="ml-auto mt-2 px-4 py-2 bg-violet-400 text-white rounded-lg hover:bg-violet-500"
          >
            댓글 등록
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">댓글 {localComments.length}개</h3>

        {localComments.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">
            첫 댓글을 작성해보세요! ✨
          </p>
        ) : (
          <div className="space-y-4">
            {localComments.map((comment) => (
              <CommentItem
                key={comment.commentId}
                comment={comment}
                postId={postId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                postAuthorId={postAuthorId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
