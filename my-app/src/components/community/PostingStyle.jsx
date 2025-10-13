import React, { useState } from "react";
import { Link } from "react-router-dom";
import PostingModal from "./PostingModal";
import ControlPosting from "./ControlPosting";
import {
  Heart,
  MessageSquare,
  UserRound,
  EllipsisVertical,
} from "lucide-react";

const PostingStyle = ({
  post,
  onDelete,
  isDeleting,
  onPostChanged,
  likePost,
  cancelLike,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [manageModal, setManageModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isLiked, setIsLiked] = useState(false);
  if (!post) {
    return <div className="text-center py-4">게시물 데이터가 없습니다.</div>;
  }

  if (isDeleting) {
    return (
      <div className="bg-white border-b text-center py-4 text-gray-500">
        삭제 중...
      </div>
    );
  }

  const handleMenuClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setModalPosition({
      x: rect.right - 10 + window.scrollX,
      y: rect.bottom + 1 + window.scrollY,
    });

    setManageModal(!manageModal);
  };

  return (
    <>
      <div className="border-b bg-white hover:drop-shadow-sm transition-colors">
        {/* 작성자 정보 */}
        <div className="p-5 flex items-center gap-3">
          <Link
            to={`/community/profile/${post.user.communityId}`}
            onClick={(e) => e.stopPropagation()}
          >
            {post.user.profileImage ? (
              <img
                src={post.user.profileImage}
                alt={`${post.user.nickname}의 프로필`}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 bg-gray-200 flex items-center justify-center">
                <UserRound className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </Link>

          <Link
            to={`/community/profile/${post.user.communityId}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base ">
                  {post.user.nickname}
                </span>
                {post.edited && (
                  <span className="text-xs text-gray-400">• 수정됨</span>
                )}
              </div>
              <span className="text-gray-500 text-sm">몇분전인지 표시</span>
            </div>
          </Link>

          <button
            onClick={handleMenuClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-auto"
          >
            <EllipsisVertical size={20} />
          </button>
        </div>

        {/* 게시물 내용 */}
        <div className="px-5 pb-3">
          {post.content.text && (
            <p className="mb-3 whitespace-pre-wrap break-words text-gray-800">
              {post.content.text}
            </p>
          )}

          {post.content.images && post.content.images.length > 0 && (
            <div
              className={`grid gap-2 ${
                post.content.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {post.content.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className={`relative overflow-hidden rounded-lg ${
                    post.content.images.length === 3 && idx === 0
                      ? "col-span-2"
                      : ""
                  } ${
                    post.content.images.length === 1
                      ? "aspect-[4/3]"
                      : "aspect-square"
                  }`}
                >
                  <img
                    src={img}
                    alt={`게시물 이미지 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="text-blue-500 hover:underline cursor-pointer text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("해시태그 클릭:", tag);
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="px-5 pb-4 flex gap-6 text-gray-500 text-sm">
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <MessageSquare size={18} />
            <span>댓글 {post.commentCount}</span>
          </button>
          <button
            className="flex items-center gap-2 hover:text-red-500 transition-colors"
            onClick={() => {
              // ✅ 현재 상태를 기준으로 판단
              if (isLiked) {
                cancelLike(post.postId);
              } else {
                likePost(post.postId);
              }
              // 그 다음 상태 변경
              setIsLiked(!isLiked);
            }}
          >
            <Heart
              size={18}
              fill={isLiked ? "red" : "none"} // 채움 여부
              stroke={isLiked ? "red" : "currentColor"} // 테두리 색
              className={isLiked ? "text-red-500" : "text-gray-500"}
            />
            <span> {post.likeCount} 좋아요</span>
          </button>
        </div>
      </div>

      {manageModal && (
        <ControlPosting
          onDelete={onDelete}
          setIsEditing={setIsEditing}
          setManageModal={setManageModal}
          post={post}
          position={modalPosition}
        />
      )}

      {isEditing && (
        <PostingModal
          setOpenPostModal={setIsEditing}
          mode="edit"
          existingPost={post}
          onPostChanged={onPostChanged}
        />
      )}
    </>
  );
};

export default PostingStyle;
