import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/AuthContext";
import { usePost } from "../../hooks/usePost";
import { useImgConverter } from "../../hooks/useImgConverter";
import ImagePreviewer from "./ImagePreviewer";

import { Image, X, ChevronDown, Globe, Users, Lock } from "lucide-react"; // ✅ 화살표 아이콘 추가

const PostingModal = ({
  setOpenPostModal,
  openPostModal,
  mode = "create",
  existingPost = null,
  onPostChanged,
}) => {
  const [themeColor, setThemeColor] = useState("");
  const [textContent, setTextContent] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [imagesUrl, setImagesUrl] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const { createPost, updatePost } = usePost();
  const { getMultipleImageUrls, isUploading } = useImgConverter();
  const fileInputRef = useRef(null);

  const visibilityOptions = [
    {
      value: "public",
      label: "전체공개",
      icon: <Globe size={18} />,
      description: "모든 사람이 볼 수 있습니다",
    },
    {
      value: "friends",
      label: "팔로우 공개",
      icon: <Users size={18} />,
      description: "팔로워만 볼 수 있습니다",
    },
    {
      value: "private",
      label: "나만 보기",
      icon: <Lock size={18} />,
      description: "나만 볼 수 있습니다",
    },
  ];

  const selectedOption = visibilityOptions.find(
    (option) => option.value === visibility
  );

  useEffect(() => {
    if (mode === "edit" && existingPost) {
      setTextContent(existingPost.content.text || "");
      setHashtags(existingPost.hashtags || []);
      setImagesUrl(existingPost.content.images || []);
      setPreviewImages(existingPost.content.images || []);
      setVisibility(existingPost.visibility || "public");
    }
  }, [mode, existingPost]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    console.log("📁 선택된 파일:", files.length, "개");

    if (files.length + imagesUrl.length > 4) {
      alert("이미지는 최대 4개까지만 업로드할 수 있습니다");
      return;
    }

    try {
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...previews]);

      console.log("📤 서버에 업로드 시작...");
      const uploadedUrls = await getMultipleImageUrls(files);

      console.log("✅ 업로드된 URL:", uploadedUrls);

      if (uploadedUrls && uploadedUrls.length > 0) {
        setImagesUrl([...imagesUrl, ...uploadedUrls]);
        alert(`${uploadedUrls.length}개의 이미지가 업로드되었습니다!`);
      } else {
        alert("이미지 업로드에 실패했습니다");
        setPreviewImages(previewImages);
      }
    } catch (error) {
      console.error("❌ 이미지 업로드 에러:", error);
      alert("이미지 업로드 중 오류가 발생했습니다");
      setPreviewImages(previewImages);
    }

    e.target.value = "";
  };

  const handleTagInput = (e) => {
    const value = e.target.value;

    if (e.key === " " && currentTag.trim()) {
      e.preventDefault();

      if (!hashtags.includes(currentTag.trim())) {
        setHashtags([...hashtags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (indexToRemove) => {
    setHashtags(hashtags.filter((_, index) => index !== indexToRemove));
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
        result = await updatePost(existingPost.postId, postData);
        if (result) {
          alert("게시물이 수정되었습니다!");
        }
      }

      if (onPostChanged && result) {
        onPostChanged(mode, result);
      }

      setOpenPostModal(false);
    } catch (error) {
      alert("처리 실패");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-white p-6 rounded-lg max-w-xl w-full mx-4 mb-16 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex justify-between items-center">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setOpenPostModal(false)}
            >
              닫기
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className="text-black rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "처리 중..."
                : isUploading
                ? "업로드 중..."
                : mode === "create"
                ? "등록"
                : "수정 완료"}
            </button>
          </div>
          <ImagePreviewer
            previewImages={previewImages}
            setPreviewImages={setPreviewImages}
            imagesUrl={imagesUrl}
            setImagesUrl={setImagesUrl}
          />
          {/* 텍스트 입력 */}
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="무슨 일이 일어나고 있나요?"
            className="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          {/* 추가된 해시태그들 */}
          <div className="flex flex-wrap gap-2 mb-2">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-600 rounded-full"
              >
                #{tag}
                <button
                  onClick={() => removeTag(index)}
                  className="hover:text-rose-700 p-1 -m-1"
                >
                  <X size={15} />
                </button>
              </span>
            ))}
          </div>

          {/* 해시태그 입력 영역 */}
          <div className="border-b px-3 pb-3 pt-1 focus-within:border-b-2 focus-within:border-rose-400 flex group">
            <span className="text-gray-400 p-2 text-lg group-focus-within:text-gray-700">
              #
            </span>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagInput}
              placeholder="해시태그 입력 후 스페이스"
              className="w-full outline-none"
            />
            <button
              onClick={handleButtonClick}
              disabled={isUploading}
              className="flex items-center gap-2 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
            >
              <Image size={22} />
              {isUploading && <span className="text-xs">업로드 중...</span>}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 공개 범위 선택 */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 w-full justify-between"
            >
              <div className="flex items-center gap-2">
                {selectedOption.icon}
                <span>{selectedOption.label}</span>
              </div>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  showVisibilityMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showVisibilityMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10">
                {visibilityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setVisibility(option.value);
                      setShowVisibilityMenu(false);
                    }}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      visibility === option.value ? "bg-rose-50" : ""
                    }`}
                  >
                    <div className="mt-0.5">{option.icon}</div>
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostingModal;
