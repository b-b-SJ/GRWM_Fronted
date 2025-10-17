import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/AuthContext";
import { usePost } from "../../hooks/usePost";
import { Image, X, ChevronDown, Globe, Users, Lock } from "lucide-react";

const PostingModal = ({
  setOpenPostModal,
  openPostModal,
  mode = "create",
  existingPost = null,
  onPostChanged, // 콜백 받기
}) => {
  const [themeColor, setThemeColor] = useState("");
  const [textContent, setTextContent] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [currentTag, setCurrentTag] = useState(""); // 현재 입력 중인 태그
  const [imagesUrl, setImagesUrl] = useState([""]);
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false); // ✅ 추가

  const { createPost, updatePost } = usePost();
  const fileInputRef = useRef(null);

  // ✅ 공개 범위 옵션 추가
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

  // ✅ 현재 선택된 옵션 찾기
  const selectedOption = visibilityOptions.find(
    (option) => option.value === visibility
  );

  // 수정 모드일 때 기존 데이터 채우기
  useEffect(() => {
    if (mode === "edit" && existingPost) {
      setTextContent(existingPost.content.text || "");
      setHashtags(existingPost.hashtags || []);
      setImagesUrl(existingPost.content.images || []);
      setVisibility(existingPost.visibility || "public");
    }
  }, [mode, existingPost]);

  //이미지 삽입
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  //스페이스바 입력 시 해시태그 추가
  const handleTagInput = (e) => {
    const value = e.target.value;

    if (e.key === " " && currentTag.trim()) {
      e.preventDefault(); // 기본 스페이스 입력 방지

      // 중복 체크 후 추가
      if (!hashtags.includes(currentTag.trim())) {
        setHashtags([...hashtags, currentTag.trim()]);
      }
      setCurrentTag(""); // 입력창 비우기
    }
  };

  // 태그 개별 삭제
  const removeTag = (indexToRemove) => {
    setHashtags(hashtags.filter((_, index) => index !== indexToRemove));
  };

  //게시글 등록
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
    console.log("포데토침", postData);
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
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setOpenPostModal(false)}
            >
              닫기
            </button>
            {/* 등록/수정 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className=" text-black rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "처리 중..."
                : mode === "create"
                ? "등록"
                : "수정 완료"}
            </button>
          </div>

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
                #{tag} {/* ✅ 화면에는 # 표시 */}
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
            {/* 해시태그 입력창 */}
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagInput}
              placeholder="해시태그 입력 후 스페이스"
              className="w-full outline-none"
            />
            {/* 이미지 추가 버튼 */}
            <button
              onClick={handleButtonClick}
              className="flex items-center gap-2 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <Image size={22} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* ✅ 공개 범위 선택 - 여기만 수정 */}
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

            {/* 드롭다운 메뉴 */}
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
