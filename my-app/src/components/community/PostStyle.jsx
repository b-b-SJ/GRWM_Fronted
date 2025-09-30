import React from "react";
import { useNavigate } from "react-router-dom";

const PostStyle = ({ postContentData, postWriterData }) => {
  const navigate = useNavigate();
  return (
    //포스팅에서 별도로 onClick 설정 안되어 있는 부분들은 누르면 죄다 상세페이지로 넘어가게 해야함
    //상세 포스팅은 url이 postId가 될 듯하오..hao(ㅋㅋ)
    <div>
      <div className="p-2 flex flex-1 gap-2">
        <button
          onClick={() => navigate("/community/profile")}
          className="w-16 h-16 rounded-full bg-cover bg-center overflow-hidden" //이미지 압축 과정 필요
          style={{
            backgroundImage: `url(${postWriterData.profileImage})`,
          }} //작성자 프로필 사진
        ></button>

        <h className="p-2">{postWriterData.nickName}</h>
      </div>
      {/*content 부분 */}
      <h className="p-2">{postContentData.content.text}</h>
      <button
        className="w-60 h-40 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${postContentData.content.images})` }} //이런 구조는 여러 이미지(최대 4개가 들어왔을 때 대응을 못함)
      ></button>
      <img></img>
    </div>
  );
};
export default PostStyle;
