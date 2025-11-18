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
      <nav className="mt-5 grid grid-cols-2 bg-white border-b-2 border-gray-100">
        <button
          className={`px-4 py-3 text-lg font-medium transition-all relative
            ${
              timeLine === "main"
                ? "text-rose-400"
                : "text-gray-400 hover:text-gray-700"
            }`}
          onClick={() => setTimeLine("main")}
        >
          메인
          {timeLine === "main" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400 rounded-t-full" />
          )}
        </button>
        <button
          className={`px-4 py-3 text-lg font-medium transition-all relative
            ${
              timeLine === "hash"
                ? "text-rose-400"
                : "text-gray-400 hover:text-gray-700"
            }`}
          onClick={() => setTimeLine("hash")}
        >
          해시태그
          {timeLine === "hash" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400 rounded-t-full" />
          )}
        </button>
      </nav>

      {timeLine === "main" ? <MainTimeLine /> : <HashtagTimeLine />}
    </div>
  );
};

export default TimeLinePage;
