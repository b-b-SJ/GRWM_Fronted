//사이드바
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Hash } from "lucide-react";
import { useHashtag } from "../../hooks/useHashtag";
import { useAuth } from "../../hooks/AuthContext";

const CommunitySidebar = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const { user } = useAuth();
  const { getSubscribedHashtags, hashtagList, loading } = useHashtag();

  // 초기 로드
  useEffect(() => {
    if (user && user.userId) {
      getSubscribedHashtags();
    }
  }, [user]);

  // ✅ 커스텀 이벤트 리스너 추가
  useEffect(() => {
    const handleSubscriptionChange = () => {
      console.log("🔔 구독 변경 감지! 사이드바 업데이트 중...");
      if (user && user.userId) {
        getSubscribedHashtags();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener(
      "hashtagSubscriptionChanged",
      handleSubscriptionChange
    );

    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener(
        "hashtagSubscriptionChanged",
        handleSubscriptionChange
      );
    };
  }, [user, getSubscribedHashtags]);

  const handleSearch = () => {
    if (!keyword.trim()) {
      alert("검색어를 입력해주세요!");
      return;
    }
    navigate(`/community/search/${keyword.trim()}`);
  };

  const handleClear = () => {
    setKeyword("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleHashtagClick = (hashtag) => {
    const cleanTag = hashtag.startsWith("#") ? hashtag.slice(1) : hashtag;
    navigate(`/community/search/${cleanTag}`);
  };

  return (
    <div className="xl:block hidden">
      <div className="min-w-80 border-r flex flex-col h-full bg-white p-4">
        {/*검색창 컨테이너 */}
        <div className="w-full my-4">
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="검색어를 입력하세요"
              className="w-full pl-5 pr-14 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            />

            {keyword && (
              <button
                onClick={handleClear}
                className="absolute right-11 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-rose-500 transition-colors"
              onClick={handleSearch}
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        <Link
          to="/community/search"
          className="text-gray-600 hover:text-rose-500 transition-colors mb-4"
        >
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg w-full">
            <Search size={20} />
            <span>고급 검색</span>
          </button>
        </Link>

        {/* 구독 중인 해시태그 섹션 */}
        <div className="mt-6 w-full border-t-2 pt-4">
          <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
            <Hash size={20} className="text-rose-500" />
            구독 중인 해시태그
          </h3>

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-4 text-gray-500 text-sm">
              로딩 중...
            </div>
          )}

          {/* 로그인 안 했을 때 */}
          {!loading && !user && (
            <div className="text-center py-4 text-gray-500 text-sm">
              로그인 후 이용 가능합니다
            </div>
          )}

          {/* 구독한 해시태그가 없을 때 */}
          {!loading && user && (!hashtagList || hashtagList.length === 0) && (
            <div className="text-center py-4 text-gray-500 text-sm">
              구독한 해시태그가 없습니다
            </div>
          )}

          {/* 해시태그 리스트 */}
          {!loading &&
            hashtagList &&
            Array.isArray(hashtagList) &&
            hashtagList.length > 0 && (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {hashtagList.map((hashtag, index) => {
                  const cleanTag = hashtag.startsWith("#")
                    ? hashtag.slice(1)
                    : hashtag;

                  return (
                    <button
                      key={index}
                      onClick={() => handleHashtagClick(hashtag)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors group flex items-center gap-2"
                    >
                      <span className="text-rose-500 group-hover:text-rose-600 font-medium">
                        #
                      </span>
                      <span className="text-gray-700 group-hover:text-rose-600 text-sm">
                        {cleanTag}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CommunitySidebar;
