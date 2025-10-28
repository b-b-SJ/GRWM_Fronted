import React, { useState, useEffect } from "react";
import { useCommunitySearch } from "../../../hooks/useCommunitySearch";
import { Search, UserRound, X, Plus, Check } from "lucide-react";
import PostList from "../../community/PostList";
import { useNavigate, useParams } from "react-router-dom";
import { useHashtag } from "../../../hooks/useHashtag";
import { useAuth } from "../../../hooks/AuthContext";

const SearchPage = () => {
  const { keyword: urlKeyword } = useParams();
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState("post");
  const [isUser, setIsUser] = useState(false);

  const { user } = useAuth();

  // 해시태그 관련
  const {
    getHashtagIdByKeyword,
    subscribeHashtag,
    unsubscribeHashtag,
    getSubscribedHashtags,
    hashtagList,
    loading: hashtagLoading,
  } = useHashtag();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentHashtagId, setCurrentHashtagId] = useState(null);

  // 검색 결과 관련
  const [postResults, setPostResults] = useState([]);
  const [hashtagResults, setHashtagResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [postPage, setPostPage] = useState(0);
  const [hashtagPage, setHashtagPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const [postHasMore, setPostHasMore] = useState(false);
  const [hashtagHasMore, setHashtagHasMore] = useState(false);
  const [userHasMore, setUserHasMore] = useState(false);

  const navigate = useNavigate();
  const { searchHashtag, searchPost, searchUser, searched, loading, error } =
    useCommunitySearch();

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

  //구독 목록 가져오기
  useEffect(() => {
    if (user && user.userId) {
      getSubscribedHashtags();
    }
  }, [user]);

  // URL 파라미터 감지
  useEffect(() => {
    if (urlKeyword) {
      setKeyword(urlKeyword);
      setSearchType("hashtag");
      setIsUser(false);
      executeSearch(urlKeyword, "hashtag");
    } else {
      setSearchType("post");
    }
  }, [urlKeyword]);

  //해시태그 검색 결과가 나오면 tagId 조회 + 구독 상태 확인
  useEffect(() => {
    const fetchHashtagInfo = async () => {
      if (searchType === "hashtag" && keyword && hashtagResults.length > 0) {
        console.log("해시태그 ID 조회:", keyword);

        // tagId 조회 (백엔드가 Long만 반환)
        const tagId = await getHashtagIdByKeyword(keyword);

        if (tagId) {
          console.log("받은 해시태그 ID:", tagId);
          setCurrentHashtagId(tagId);

          //구독 목록에서 현재 해시태그가 있는지 확인
          const isCurrentlySubscribed = hashtagList.some(
            (hashtag) => hashtag.tagId === tagId
          );

          console.log("구독 상태:", isCurrentlySubscribed);
          setIsSubscribed(isCurrentlySubscribed);
        }
      }
    };

    fetchHashtagInfo();
  }, [searchType, keyword, hashtagResults, hashtagList]);

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

  const handleSearch = async (hasMore = false) => {
    executeSearch(keyword, searchType, hasMore);
  };

  // ✅ 구독/구독취소 처리
  const handleSubscribe = async () => {
    if (!user || !user.userId) {
      alert("로그인이 필요합니다");
      return;
    }

    if (!keyword.trim()) {
      alert("검색어를 입력해주세요");
      return;
    }

    try {
      // tagId가 없으면 먼저 조회
      let tagId = currentHashtagId;

      if (!tagId) {
        console.log("해시태그 ID 조회 중...");
        tagId = await getHashtagIdByKeyword(keyword);

        if (!tagId) {
          alert("해시태그 정보를 찾을 수 없습니다");
          return;
        }

        setCurrentHashtagId(tagId);
      }

      // 구독/구독취소 실행
      if (isSubscribed) {
        // 구독 취소
        const success = await unsubscribeHashtag(tagId);
        if (success) {
          setIsSubscribed(false);
          // 구독 목록 다시 불러오기
          await getSubscribedHashtags();
          alert("구독이 취소되었습니다");
        }
      } else {
        // 구독
        console.log("구독 요청:", { userId: user.userId, tagId });
        const success = await subscribeHashtag(user.userId, tagId);

        if (success) {
          setIsSubscribed(true);
          await getSubscribedHashtags();
          alert(`#${keyword} 해시태그를 구독했습니다!`);
        }
      }
    } catch (error) {
      console.error("구독 처리 실패:", error);
      alert("구독 처리에 실패했습니다");
    }
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
    setIsSubscribed(false);
    setCurrentHashtagId(null);
    navigate("/community/search", { replace: true });
  };

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

          <div className="relative flex-1 group">
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
              className="w-full px-5 py-3 pr-10 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            {keyword && (
              <button
                onClick={handleClear}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-rose-500 transition-colors"
              onClick={() => handleSearch(false)}
              disabled={loading}
            >
              <Search size={20} />
            </button>
          </div>

          {/* 해시태그 검색일 때만 구독 버튼 */}
          {searchType === "hashtag" && !isUser ? (
            <button
              onClick={handleSubscribe}
              disabled={loading || hashtagLoading}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium ${
                isSubscribed
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-rose-500 text-white hover:bg-rose-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubscribed ? (
                <>
                  <Check size={20} />
                  구독중
                </>
              ) : (
                <>
                  <Plus size={20} />
                  구독
                </>
              )}
            </button>
          ) : (
            <div className="w-24"></div>
          )}
        </div>
      </div>

      {/* 검색 타입 선택 탭 */}
      {!isUser && (
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setSearchType("post")}
            className={`px-4 py-2 transition-colors ${
              searchType === "post"
                ? "border-b-2 border-rose-500 font-semibold text-rose-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            게시글
          </button>
          <button
            onClick={() => setSearchType("hashtag")}
            className={`px-4 py-2 transition-colors ${
              searchType === "hashtag"
                ? "border-b-2 border-rose-500 font-semibold text-rose-600"
                : "text-gray-600 hover:text-gray-800"
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

          {!isUser && (searchType === "post" || searchType === "hashtag") && (
            <PostList posts={currentResults} />
          )}

          {isUser && (
            <div className="space-y-3">
              {currentResults.map((user) => (
                <div
                  key={user.communityId}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
                  onClick={() =>
                    navigate(`/community/profile/${user.communityId}`)
                  }
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.nickname}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 bg-gray-200 flex items-center justify-center">
                      <UserRound className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

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

          {currentHasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 font-medium transition-colors"
            >
              {loading ? "로딩 중..." : "더보기"}
            </button>
          )}
        </div>
      )}

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
