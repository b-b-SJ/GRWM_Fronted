//사이드바
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

const CommunitySidebar = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  //검색 실행 함수
  const handleSearch = () => {
    if (!keyword.trim()) {
      alert("검색어를 입력해주세요!");
      return;
    }
    // 검색어와 함께 검색 페이지로 이동
    navigate(`/community/search/${keyword.trim()}`);
  };

  //검색창 비우기
  const handleClear = () => {
    setKeyword("");
  };

  //Enter 키 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="xl:block hidden">
      <div className="min-w-80 border-r flex flex-col h-full bg-white items-center p-4">
        {/*검색창 컨테이너 */}
        <div className="w-64 my-4">
          {/*검색 input + 아이콘들 */}
          <div className="relative">
            {/* 검색 input */}
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="검색어를 입력하세요"
              className=" w-full pl-5 pr-14 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            />

            {/* 오른쪽 X 버튼 (검색어가 있을 때만) */}
            {keyword && (
              <button
                onClick={handleClear}
                className="absolute right-11 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
            {/* 왼쪽 돋보기 아이콘 */}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={handleSearch}
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* 기존 링크 (일단 지금은 유지)*/}
        <Link
          to="/community/search"
          className="text-gray-600 hover:text-rose-500 transition-colors"
        >
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
            <Search size={20} />
            <span>고급 검색</span>
          </button>
        </Link>

        <div className="mt-40 w-full border-t-2 text-gray-700">
          <h>구독 중인 해시태그</h>
        </div>
      </div>
    </div>
  );
};

export default CommunitySidebar;
