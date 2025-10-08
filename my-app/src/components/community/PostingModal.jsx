import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { usePost } from "../../hooks/usePost";
import { Image } from "lucide-react";
const PostingModal = ({ setOpenPostModal, openPostModal, profilePic }) => {
  // useEffect(() => {}), []; //이거 할 때만 re렌더
  const [textContent, setTextContent] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const { user } = useAuth();
  const { createPost } = usePost();
  const fileInputRef = useRef(null);
  const handleButtonClick = () => {
    fileInputRef.current?.click(); // 숨겨진 input을 클릭!
  };

  //post 등록 handler

  const handleSubmit = async () => {
    // 이 객체가 createPost의 매개변수로 들어감
    const postData = {
      content: {
        //이거 둘 중 하나라도 비어 있으면 업로드 안되게 막는 작업 필요
        text: textContent, // state에서 가져온 텍스트
        images: [], // -> 나중에 이미지 업로드 api랑 연결하면 뭐너흘듯
      },
      hashtags: hashtags, // state에서 가져온 해시태그 배열 -> #빼고 주기
      visibility: visibility,
    };

    // 훅에서 가져온 함수 호출
    try {
      const result = await createPost(postData);
      if (result) {
        setOpenPostModal(false);
        alert("게시글이 등록되었습니다");
      }
    } catch (error) {
      alert("게시글 작성 실패");
      console.error(error);
    }
  };

  //여기에서 간단한 인포 불러오는 api랑 연결-> useProfile에서 연결되게 코드 추가 작성해야됨

  //해시태그 부분에서는 띄어쓰기 받으면 바로 해시태그 형태?가 되도록..-> 받는 area가 글 작성 부분이랑 구분 되어 있음
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop">
      <div
        className="bg-white p-6 rounded-lg max-w-xl mx-auto mt-56"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className=" space-y-2 mx-2">
          <buttons className="space=content-between">
            <button
              className="pb-3 pr-4" //오른쪽으로..
              onClick={() => setOpenPostModal(false)}
            >
              닫기
            </button>
            <button className="pl-8" onClick={handleSubmit}>
              등록
            </button>
          </buttons>
          <img />

          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="무슨 일이 일어나고 있나요?"
            style={{
              resize: "none", // 크기 조절 막기
              width: "100%",
              height: "150px", // 원하는 높이
              overflowY: "auto", // 스크롤 활성화
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>
        <button
          onClick={handleButtonClick}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Image size={20} />
          <span>이미지 추가</span>
        </button>

        <input type="file" accept="image/*" multiple className="hidden" />
      </div>
    </div>
  );
};
export default PostingModal;
