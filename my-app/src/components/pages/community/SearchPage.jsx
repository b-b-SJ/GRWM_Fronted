import React, { useState, useEffect } from "react";
import { useCommunitySearch } from "../../../hooks/useCommunitySearch";
import { Search, UserRound, X } from "lucide-react";
import PostList from "../../community/PostList";
import { useNavigate, useParams } from "react-router-dom";

const SearchPage = () => {
  const { keyword: urlKeyword } = useParams(); // ✅ URL에서 검색어 가져오기
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState("post");
  const [isUser, setIsUser] = useState(false);

  // 타입별로 결과 분리 저장
  const [postResults, setPostResults] = useState([]);
  const [hashtagResults, setHashtagResults] = useState([]);
  const [userResults, setUserResults] = useState([]);

  // 각 타입별 페이지 정보
  const [postPage, setPostPage] = useState(0);
  const [hashtagPage, setHashtagPage] = useState(0);
  const [userPage, setUserPage] = useState(0);

  // 각 타입별 hasMore
  const [postHasMore, setPostHasMore] = useState(false);
  const [hashtagHasMore, setHashtagHasMore] = useState(false);
  const [userHasMore, setUserHasMore] = useState(false);

  const navigate = useNavigate();
  const { searchHashtag, searchPost, searchUser, searched, loading, error } =
    useCommunitySearch();

  // 현재 보여줄 결과 계산
  const currentResults = isUser
    ? userResults
    : searchType === "post"
    ? postResults
    : hashtagResults;

  const currentHasMore = isUser
    ? userHasMore
    : searchType === "post"
    ? postHasMore
    : hashtagHasMore;

  // ✅ URL 파라미터가 있으면 자동 검색
  useEffect(() => {
    if (urlKeyword) {
      console.log("🔍 URL에서 검색어 감지:", urlKeyword);
      setKeyword(urlKeyword); // 검색창에 표시
      setSearchType("hashtag"); // 해시태그 탭으로 전환
      setIsUser(false); // 유저 검색 체크 해제

      // 자동 검색 실행
      executeSearch(urlKeyword, "hashtag");
    }
  }, [urlKeyword]); // urlKeyword가 변경될 때마다 실행

  //검색 실행 로직 분리
  const executeSearch = async (
    searchKeyword,
    type = searchType,
    hasMore = false
  ) => {
    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요!");
      return;
    }

    let result;
    let pageToLoad;

    if (isUser) {
      pageToLoad = hasMore ? userPage : 0;
      result = await searchUser(searchKeyword, pageToLoad, 30);

      if (result) {
        if (hasMore) {
          setUserResults((prev) => [...prev, ...(result.users || [])]);
        } else {
          setUserResults(result.users || []);
          setUserPage(0);
        }
        setUserHasMore(result.hasMore);
        setUserPage(pageToLoad + 1);
      }
    } else if (type === "post") {
      pageToLoad = hasMore ? postPage : 0;
      result = await searchPost(searchKeyword, pageToLoad, 30);

      if (result) {
        if (hasMore) {
          setPostResults((prev) => [...prev, ...(result.postList || [])]);
        } else {
          setPostResults(result.postList || []);
          setPostPage(0);
        }
        setPostHasMore(result.hasMore);
        setPostPage(pageToLoad + 1);
      }
    } else if (type === "hashtag") {
      pageToLoad = hasMore ? hashtagPage : 0;
      result = await searchHashtag(searchKeyword, pageToLoad, 30);

      if (result) {
        if (hasMore) {
          setHashtagResults((prev) => [...prev, ...(result.postList || [])]);
        } else {
          setHashtagResults(result.postList || []);
          setHashtagPage(0);
        }
        setHashtagHasMore(result.hasMore);
        setHashtagPage(pageToLoad + 1);
      }
    }
  };

  // ✅ 기존 handleSearch는 executeSearch 호출
  const handleSearch = async (hasMore = false) => {
    executeSearch(keyword, searchType, hasMore);
  };

  const handleLoadMore = () => {
    handleSearch(true);
  };

  const handleClear = () => {
    setKeyword("");
    setPostResults([]);
    setHashtagResults([]);
    setUserResults([]);
    setPostPage(0);
    setHashtagPage(0);
    setUserPage(0);
    setPostHasMore(false);
    setHashtagHasMore(false);
    setUserHasMore(false);

    // ✅ URL도 초기화 (선택사항)
    navigate("/community/search", { replace: true });
  };

  // 결과는 일단 유지하면서 UI만 전환

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
                ? "bg-rose-100 border-2 border-rose-400"
                : "bg-gray-100 border-2 border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={isUser}
              onChange={(e) => setIsUser(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
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
              className="w-full px-5 py-3 pr-10 border border-gray-300 rounded-3xl focus:ring-rose-400"
            />
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
      {!isUser && (
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setSearchType("post")}
            className={`px-4 py-2 ${
              searchType === "post"
                ? "border-b-2 border-rose-500 font-semibold"
                : ""
            }`}
          >
            게시글
          </button>
          <button
            onClick={() => setSearchType("hashtag")}
            className={`px-4 py-2 ${
              searchType === "hashtag"
                ? "border-b-2 border-rose-500 font-semibold"
                : ""
            }`}
          >
            해시태그
          </button>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {currentResults.length > 0 && (
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
            <PostList posts={currentResults} />
          )}

          {/* 유저 검색 결과 */}
          {isUser && (
            <div className="space-y-3">
              {currentResults.map((user) => (
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
          {currentHasMore && (
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
      {currentResults.length === 0 && !loading && keyword && searched && (
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
      {currentResults.length === 0 && !keyword && !loading && (
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
