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
      <nav className="flex flex-1 justify-normal">
        <Link to={`/community/profile/1`}>
          <div className="bg-rose-400 rounded-full text-white p-5">프1</div>
        </Link>
        <Link to={`/community/profile/2`}>
          <div className="bg-blue-400 rounded-full text-white p-5">프2</div>
        </Link>
      </nav>
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

      {timeLine === "main" ? <MainTimeLine /> : <HashtagTimeLine />}
    </div>
  );
};

export default TimeLinePage;
