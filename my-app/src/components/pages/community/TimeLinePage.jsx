//타임라인 페이지 -> 헤더 부분 포함
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainTimeLine from "../../community/MainTimeLine";
import HashtagTimeLine from "../../community/HashtagTimeLine";
import PostingStyle from "../../community/PostingStyle";
const TimeLinePage = () => {
  const [timeLine, setTimeLine] = useState("main");
  return (
    <div>
      <h1 className="bg-fuchsia-300 text-3xl p-4">타임라인 헤더 - 수정 예정</h1>
      <nav className="flex gap-4 p-4 bg-fuchsia-400 w-fit">
        <button
          className={`px-4 py-2 rounded-xl
    ${timeLine === "main" ? "bg-blue-400 text-white" : "bg-white"}`}
          onClick={() => setTimeLine("main")}
        >
          메인
        </button>
        <button
          className={`px-4 py-2 rounded-xl
    ${timeLine === "hash" ? "bg-blue-400 text-white" : "bg-white"}`}
          onClick={() => setTimeLine("hash")}
        >
          해시태그
        </button>
      </nav>
      <PostingStyle communityId={"youyousangjong"} postId={"12"} />
      <PostingStyle communityId={"youyousangjong"} postId={"120"} />
      <PostingStyle communityId={"gyudong"} postId={"21"} />

      {timeLine === "main" ? <MainTimeLine /> : <HashtagTimeLine />}
    </div>
  );
};

export default TimeLinePage;
