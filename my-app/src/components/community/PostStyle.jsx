import React from "react";
import { usePost } from "../../hooks/usePost";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, EllipsisVertical } from "lucide-react";
import { useParams } from "react-router-dom";
const PostingStyle = ({ post }) => {
  const params = useParams();

  //지금으로부터 얼마 경과했는지
  const postWriterData = posts.getUserSimpProfile(communityId);
  const postContentData = posts.getContent(postId);

  console.log("ㅇ", postContentData, postWriterData);

  return (
    <div className="cursor-pointer border-b  bg-white ">
      {/* 작성자 정보 */}
      <div className="p-5 flex items-center gap-3">
        <Link
          to={`/community/profile/${postWriterData.communityId}`}
          onClick={(e) => e.stopPropagation()} // 상세 페이지 이동 방지
        >
          <img
            src={postWriterData.profileImage}
            alt={`${postWriterData.nickName}의 프로필 사진`}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        </Link>
        <Link
          to={`/community/profile/${postWriterData.communityId}`}
          onClick={(e) => e.stopPropagation()} // 상세 페이지 이동 방지
        >
          <div className="flex flex-col">
            <span className="font-semibold text-base">
              {postWriterData.nickName}
            </span>
            <span className=" text-gray-700 text-sm">몇분전인지 표시</span>
          </div>
        </Link>
        <button className="flex ml-auto">
          <EllipsisVertical />
        </button>
      </div>

      {/* 컨텐츠 부분 - 텍스트와 이미지를 세로로 배치 */}
      <div className="px-5 pb-3 gap-y=8">
        {/* 이미지들 */}
        {postContentData.content.images &&
          postContentData.content.images.length > 0 && (
            <div
              className={`grid gap-2 ${
                postContentData.content.images.length === 1
                  ? "grid-cols-1"
                  : postContentData.content.images.length === 2
                  ? "grid-cols-2"
                  : postContentData.content.images.length === 3
                  ? "grid-cols-2"
                  : "grid-cols-2"
              }`}
            >
              {postContentData.content.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className={`relative overflow-hidden rounded-lg ${
                    postContentData.content.images.length === 3 && idx === 0
                      ? "col-span-2"
                      : ""
                  } ${
                    postContentData.content.images.length === 1
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
        {postContentData.content.text && (
          <p className="my-3 whitespace-pre-wrap break-words">
            {postContentData.content.text}
          </p>
        )}
      </div>

      {/* 해시태그 */}
      {postContentData.hashtags && postContentData.hashtags.length > 0 && (
        <div className="px-5 py-5 flex flex-wrap gap-2">
          {postContentData.hashtags.map((tag, idx) => (
            <span
              key={idx}
              className="text-blue-500 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                // 해시태그 클릭 이벤트 처리
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
          댓글 {postContentData.commentCount}
        </span>
        <span className="flex flex-row gap-2">
          <Heart />
          좋아요 {postContentData.likeCount}
        </span>
      </div>
    </div>
  );
};

export default PostingStyle;
