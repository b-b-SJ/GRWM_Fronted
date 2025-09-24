//메인 탐라
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainTimeLine from "../../community/MainTimeLine";
import HashtagTimeLine from "../../community/HashtagTimeLine";
import PostingStyle from "../../community/PostingStyle";
const TimeLinePage = () => {
  const [timeLine, setTimeLine] = useState("main");
  return (
    <div>
      <h1 className="bg-fuchsia-300 text-3xl p-4">
        길길이 날뛰며 엉엉슨 울며 얘기했다, 여기라고, 여기가 타임라인 페이지라고
      </h1>
      <nav className="flex gap-7 p-4 bg-fuchsia-400 w-fit">
        <button
          className={`px-4 py-2 rounded-xl
    ${timeLine === "main" ? "bg-blue-400 text-white" : "bg-white"}`}
          onClick={() => setTimeLine("main")}
        >
          듀듀듀듀듀
        </button>
        <button
          className={`px-4 py-2 rounded-xl
    ${timeLine === "hash" ? "bg-blue-400 text-white" : "bg-white"}`}
          onClick={() => setTimeLine("hash")}
        >
          엉등이
        </button>
      </nav>
      <PostingStyle />
      {timeLine === "main" ? <MainTimeLine /> : <HashtagTimeLine />}
    </div>
  );
};

export default TimeLinePage;
