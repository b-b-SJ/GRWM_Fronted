import React, { useState, useEffect } from "react";
import { useCommunitySearch } from "../../../hooks/useCommunitySearch";
import { Search, UserRound, X } from "lucide-react";
import PostList from "../../community/PostList";
import { useNavigate } from "react-router-dom";
const SearchPage = () => {
  // 검색어 관리
  const [keyword, setKeyword] = useState("");

  //검색 타입: post, user, hashtag
  const [searchType, setSearchType] = useState("post"); // 게시글 타입 (post/hashtag)
  const [isUser, setIsUser] = useState(false); //유저모드
  const [currentPage, setCurrentPage] = useState(0);
  const [allResults, setAllResults] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const navigate = useNavigate();
  const { searchHashtag, searchPost, searchUser, searched, loading, error } =
    useCommunitySearch();

  // ✅ 검색 실행 함수
  const handleSearch = async (hasMore = false) => {
    // 검색어가 없으면 리턴
    if (!keyword.trim()) {
      alert("검색어를 입력해주세요!");
      return;
    }

    const pageToLoad = hasMore ? currentPage : 0;

    let result;

    // 검색 타입에 따라 다른 함수 호출
    if (isUser) {
      result = await searchUser(keyword, pageToLoad, 30);
    } else if (searchType === "post") {
      result = await searchPost(keyword, pageToLoad, 30);
    } else if (searchType === "hashtag") {
      result = await searchHashtag(keyword, pageToLoad, 30);
    }
    console.log("머가 오노", result);
    // ✅ 결과 처리
    if (result) {
      if (hasMore) {
        // 더보기: 기존 결과에 추가
        setAllResults((prev) => [
          ...prev,
          ...(result.postList || result.users || []),
        ]);
      } else {
        // 새 검색: 기존 결과 초기화
        setAllResults(result.postList || result.users || []);
        setCurrentPage(0);
      }

      setHasMore(result.hasMore);
      setCurrentPage(pageToLoad + 1);
    }
  };

  const handleLoadMore = () => {
    handleSearch(true);
  };

  //검색 초기화
  const handleClear = () => {
    setKeyword("");
    setAllResults([]);
    setCurrentPage(0);
    setHasMore(false);
  };

  //검색 타입 변경 시 자동결과 초기화

  useEffect(() => {
    setAllResults([]);
    setCurrentPage(0);
    setHasMore(false);
  }, [isUser, searchType]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* 검색 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">검색</h1>
        <p className="text-gray-600">게시글, 유저, 해시태그를 검색하세요</p>
      </div>

      {/* 검색창 */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setIsUser(!isUser)}
            className={`flex gap-2 px-3 py-2 rounded-lg items-center transition-colors ${
              isUser
                ? "bg-rose-100 border-2 border-rose-400" // 켜졌을 때 분홍색
                : "bg-gray-100 border-2 border-gray-300" // 꺼졌을 때 회색
            }`}
          >
            <input
              type="checkbox"
              checked={isUser}
              onChange={(e) => setIsUser(e.target.checked)}
              onClick={(e) => e.stopPropagation()} // 중복 방지
            />
            <UserRound
              size={24}
              className={isUser ? "text-rose-500" : "text-gray-600"}
            />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(false)}
              placeholder={
                searchType === "hashtag"
                  ? "#없이 입력하세요 (예: 일상)"
                  : "검색어를 입력하세요"
              }
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-3xl focus:ring-rose-400"
            />
            {console.log(allResults)}
            {keyword && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <button
            onClick={() => handleSearch(false)}
            disabled={loading}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Search size={20} />
            {loading ? "검색중..." : "검색"}
          </button>
        </div>
      </div>

      {/* 검색 타입 선택 탭 */}
      {/* 유저 모드가 아닐 때만 게시글/해시태그 탭 표시 */}
      {!isUser && (
        <div className="flex gap-2 mb-6 border-b">
          <button onClick={() => setSearchType("post")}>게시글</button>
          <button onClick={() => setSearchType("hashtag")}>해시태그</button>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {allResults.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              검색 결과
              {searched?.totalCount && (
                <span className="text-gray-500 font-normal ml-2">
                  ({searched.totalCount}개)
                </span>
              )}
            </h2>
          </div>

          {/* 게시글 또는 해시태그 검색 결과 */}
          {!isUser && (searchType === "post" || searchType === "hashtag") && (
            <PostList posts={allResults} />
          )}

          {/* 유저 검색 결과 */}
          {isUser && (
            <div className="space-y-3">
              {allResults.map((user) => (
                <div
                  key={user.communityId}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/community/profile/${user.communityId}`)
                    }
                  >
                    {user.profileImage ? (
                      <img
                        src={user?.profileImage}
                        alt={user?.userName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 bg-gray-200 flex items-center justify-center">
                        <UserRound className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-lg">{user.nickname}</p>
                    {user.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {user.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 더보기 버튼 */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 font-medium"
            >
              {loading ? "로딩 중..." : "더보기"}
            </button>
          )}
        </div>
      )}

      {/* 결과 없음 */}
      {allResults.length === 0 && !loading && keyword && searched && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">
            다른 검색어를 입력해보세요.
          </p>
        </div>
      )}

      {/* 초기 상태 */}
      {allResults.length === 0 && !keyword && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-rose-500" />
          </div>
          <p className="text-gray-600 text-lg">
            검색어를 입력하고 검색해보세요!
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
