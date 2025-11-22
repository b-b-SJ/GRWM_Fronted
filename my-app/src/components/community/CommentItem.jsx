import React, { useState } from "react";
import { Trash2, Edit2, Lock, UserRound } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
const CommentItem = ({ comment, postId, onUpdate, onDelete, postAuthorId }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editIsPrivate, setEditIsPrivate] = useState(comment.private); //private
  const navigate = useNavigate();

  // 본인 댓글인지 확인
  const isMyComment = user.userId === comment.user?.communityId;
  const isMyPost = postAuthorId === user.userId;
  const canViewPrivateComment = isMyComment || isMyPost;

  // 비공개 댓글인데 볼 권한 없으면 숨기기
  if (comment.private && !canViewPrivateComment) {
    return (
      <div className="border-b pb-4">
        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-2 text-gray-400">
          <Lock size={16} />
          <span className="text-sm italic">비공개 댓글입니다</span>
        </div>
      </div>
    );
  }
  // 수정 완료
  const handleSave = async () => {
    if (!editContent.trim()) {
      alert("댓글 내용을 입력해주세요");
      return;
    }

    console.log("나 비밀?", editIsPrivate);
    await onUpdate(comment.commentId, editContent, editIsPrivate);
    setIsEditing(false);
  };

  // 수정 취소
  const handleCancel = () => {
    setEditContent(comment.content);
    setEditIsPrivate(comment.private);
    setIsEditing(false);
  };

  return (
    <div className="border-b pb-4">
      <div className="flex items-start gap-3">
        {/* 프로필 사진 */}
        <div
          className="cursor-pointer"
          onClick={() =>
            navigate(`/community/profile/${comment.user.communityId}`)
          }
        >
          {comment.user.profileImage ? (
            <img
              src={comment.user?.profileImage}
              alt={comment.user?.userName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border-2 bg-gray-200 flex items-center justify-center">
              <UserRound className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          {/* 닉네임 & 시간 */}
          <div
            className="flex items-center gap-2 mb-2 cursor-pointer"
            onClick={() =>
              navigate(`/community/profile/${comment.user.communityId}`)
            }
          >
            <span className="font-semibold text-sm">
              {comment.user?.nickname}
            </span>
            {comment.private && (
              <Lock size={14} className="text-gray-500" title="비공개 댓글" />
            )}
            <span className="text-xs text-gray-500">
              {comment.createdAt
                ? new Date(comment.createdAt).toLocaleString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "방금 전"}
            </span>
          </div>

          {/* 댓글 내용 */}
          {isEditing ? (
            // 수정 모드
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={3}
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id={`edit-private-${comment.commentId}`}
                  checked={editIsPrivate}
                  onChange={(e) => setEditIsPrivate(e.target.checked)}
                  className="w-4 h-4"
                />
                <label
                  htmlFor={`edit-private-${comment.commentId}`}
                  className="text-sm text-gray-600"
                >
                  비공개 댓글
                </label>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-violet-500 text-white text-sm rounded hover:bg-violet-600"
                >
                  저장
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-300 text-sm rounded hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            //보기 모드
            <>
              <p className="text-gray-800 whitespace-pre-wrap break-words">
                {comment.content}
              </p>

              {/* 수정/삭제 버튼 (본인 댓글만) */}
              {isMyComment && (
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-violet-500 transition-colors"
                  >
                    <Edit2 size={14} />
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(comment.commentId)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                    삭제
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
