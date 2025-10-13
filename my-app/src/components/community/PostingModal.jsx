import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/AuthContext";
import { usePost } from "../../hooks/usePost";
import { Image } from "lucide-react";

const PostingModal = ({
  setOpenPostModal,
  openPostModal,
  mode = "create",
  existingPost = null,
  onPostChanged, // 콜백 받기
}) => {
  const [textContent, setTextContent] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [imagesUrl, setImagesUrl] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPost, updatePost } = usePost();
  const fileInputRef = useRef(null);

  // 수정 모드일 때 기존 데이터 채우기
  useEffect(() => {
    if (mode === "edit" && existingPost) {
      setTextContent(existingPost.content.text || "");
      setHashtags(existingPost.hashtags || []);
      setImagesUrl(existingPost.content.images || []);
      setVisibility(existingPost.visibility || "public");
    }
  }, [mode, existingPost]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!textContent.trim()) {
      alert("텍스트를 입력해주세요");
      return;
    }

    setIsSubmitting(true);

    const postData = {
      content: {
        text: textContent,
        images: imagesUrl,
      },
      hashtags: hashtags,
      visibility: visibility,
    };

    try {
      let result;

      if (mode === "create") {
        result = await createPost(postData);
        if (result) {
          alert("게시글이 등록되었습니다");
        }
      } else {
        // 수정 모드
        result = await updatePost(existingPost.postId, postData);
        if (result) {
          alert("게시물이 수정되었습니다!");
        }
      }

      // 부모에게 변경 알림
      if (onPostChanged && result) {
        onPostChanged(mode, result);
      }

      // 모달 닫기
      setOpenPostModal(false);
    } catch (error) {
      alert("처리 실패");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      // onClick={() => setOpenPostModal(false)}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-xl w-full mx-4 mb-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {mode === "create" ? "새 게시물" : "게시물 수정"}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setOpenPostModal(false)}
            >
              닫기
            </button>
          </div>

          {/* 텍스트 입력 */}
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="무슨 일이 일어나고 있나요?"
            className="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          {/* 이미지 추가 버튼 */}
          <button
            onClick={handleButtonClick}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Image size={20} />
            <span>이미지 추가</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* 등록/수정 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-rose-400 text-white py-3 rounded-lg hover:bg-rose-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "처리 중..."
              : mode === "create"
              ? "등록"
              : "수정 완료"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostingModal;
