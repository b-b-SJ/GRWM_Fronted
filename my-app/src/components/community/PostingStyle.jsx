import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, EllipsisVertical } from "lucide-react";

const PostingStyle = ({ post }) => {
  console.log("받은 post:", post); // undefined인지 확인
  console.log("post.user:", post?.user); // ?. 사용해서 안전하게 확인

  // 임시로 이렇게 해서 에러 방지
  if (!post) {
    return <div>게시물 데이터가 없습니다.</div>;
  }

  return (
    <div className="cursor-pointer border-b bg-white">
      {/* 작성자 정보 */}
      <div className="p-5 flex items-center gap-3">
        <Link
          to={`/community/profile/${post.user.communityId}`}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={post.user.profileImage}
            alt={`${post.user.userName}의 프로필 사진`}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        </Link>
        <Link
          to={`/community/profile/${post.user.communityId}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col">
            <span className="font-semibold text-base">
              {post.user.userName}
            </span>
            <span className="text-gray-700 text-sm">몇분전인지 표시</span>
          </div>
        </Link>
        <button className="flex ml-auto">
          <EllipsisVertical />
        </button>
      </div>

      {/* 컨텐츠 부분 - 텍스트와 이미지를 세로로 배치 */}
      <div className="px-5 pb-3">
        {/* 이미지들 */}
        {post.content.images && post.content.images.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.content.images.length === 1
                ? "grid-cols-1"
                : post.content.images.length === 2
                ? "grid-cols-2"
                : post.content.images.length === 3
                ? "grid-cols-2"
                : "grid-cols-2"
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
                  alt={`post image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 텍스트 */}
        {post.content.text && (
          <p className="my-3 whitespace-pre-wrap break-words">
            {post.content.text}
          </p>
        )}
      </div>

      {/* 해시태그 */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="px-5 py-5 flex flex-wrap gap-2">
          {post.hashtags.map((tag, idx) => (
            <span
              key={idx}
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                // 해시태그 클릭 이벤트 처리
                console.log("해시태그 클릭:", tag);
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 좋아요/댓글 카운트 */}
      <div className="px-5 pb-5 flex gap-6 text-gray-600 flex-row">
        <span className="flex flex-row gap-2">
          <MessageSquare />
          댓글 {post.commentCount}
        </span>
        <span className="flex flex-row gap-2">
          <Heart />
          좋아요 {post.likeCount}
        </span>
      </div>
    </div>
  );
};

export default PostingStyle;
