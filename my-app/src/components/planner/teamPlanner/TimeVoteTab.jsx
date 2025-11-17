// TimeVoteTab.jsx
import React, { useState, useEffect } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { Clock, Plus, ChevronRight } from "lucide-react";
import TimeVoteList from "./timeVote/TimeVoteLista";
import TimeVoteCreate from "./timeVote/TimeVoteCreate";
import TimeVoteGrid from "./timeVote/TimeVoteGrid";

/**
 * 시간 투표 탭
 * - 투표 목록
 * - 투표 생성
 * - 투표하기/결과 보기
 */
const TimeVoteTab = ({ plannerId }) => {
  const {
    createTimeVote,
    submitTimeVote,
    updateTimeVote,
    fetchTimeVoteDetail,
    fetchTimeVoteList,
  } = useTeamPlanner();

  const [mode, setMode] = useState("list"); // 'list' | 'create' | 'vote' | 'view'
  const [voteList, setVoteList] = useState([]);
  const [currentVote, setCurrentVote] = useState(null);
  const [loading, setLoading] = useState(false);

  // 투표 목록 로드
  const loadVoteList = async () => {
    setLoading(true);
    try {
      const list = await fetchTimeVoteList(plannerId);
      setVoteList(list || []);
    } catch (error) {
      console.error("투표 목록 로드 실패:", error);
      setVoteList([]);
    } finally {
      setLoading(false);
    }
  };

  // 투표 상세 로드

  const loadVoteDetail = async (voteId) => {
    setLoading(true);
    try {
      const detail = await fetchTimeVoteDetail(plannerId, voteId);
      console.log("디테일을 줄게");
      setCurrentVote(detail);
    } catch (error) {
      console.error("투표 상세 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 투표 생성
  const handleCreateVote = async (formData) => {
    try {
      await createTimeVote(plannerId, formData);
      alert("시간 투표가 생성되었습니다!");
      setMode("list");
      loadVoteList();
    } catch (error) {
      console.error("투표 생성 실패:", error);
      alert("투표 생성에 실패했습니다.");
    }
  };

  // 투표 제출
  const handleSubmitVote = async (selectedSlots) => {
    try {
      await submitTimeVote(plannerId, currentVote.id, selectedSlots);
      alert("투표가 제출되었습니다!");
      loadVoteDetail(currentVote.id);
      setMode("view");
    } catch (error) {
      console.error("투표 제출 실패:", error);
      alert("투표 제출에 실패했습니다.");
    }
  };

  // 재투표
  const handleUpdateVote = async (selectedSlots) => {
    try {
      await updateTimeVote(plannerId, currentVote.id, selectedSlots);
      alert("투표가 수정되었습니다!");
      loadVoteDetail(currentVote.id);
      setMode("view");
    } catch (error) {
      console.error("재투표 실패:", error);
      alert("재투표에 실패했습니다.");
    }
  };

  // 초기 로드
  useEffect(() => {
    if (mode === "list") {
      loadVoteList();
    }
  }, [mode, plannerId]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 목록 모드 */}
      {mode === "list" && (
        <div className="h-full flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-gray-600" />
                <h3 className="font-semibold text-base">시간 투표</h3>
              </div>
              <button
                onClick={() => setMode("create")}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="새 투표 만들기"
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              팀원들과 함께 가능한 시간을 찾아보세요
            </p>
          </div>

          {/* 투표 목록 */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 text-sm">로딩 중...</div>
              </div>
            )}

            {!loading && voteList.length === 0 && (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm mb-4">
                  진행 중인 투표가 없습니다
                </p>
                <button
                  onClick={() => setMode("create")}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  첫 투표 만들기 →
                </button>
              </div>
            )}

            {/* 투표 카드 목록 */}
            <div className="space-y-2">
              {voteList.map((vote) => (
                <VoteCard
                  key={vote.id}
                  vote={vote}
                  onClick={() => {
                    setCurrentVote(vote);
                    setMode("view");
                    loadVoteDetail(vote.id);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 생성 모드 */}
      {mode === "create" && (
        <TimeVoteCreate
          onSubmit={handleCreateVote}
          onCancel={() => setMode("list")}
        />
      )}

      {/* 투표/결과 모드 */}
      {(mode === "vote" || mode === "view") && currentVote && (
        <TimeVoteGrid
          vote={currentVote}
          mode={mode}
          onSubmitVote={handleSubmitVote}
          onUpdateVote={handleUpdateVote}
          onModeChange={setMode}
          onBack={() => setMode("list")}
        />
      )}
    </div>
  );
};

/**
 * 투표 카드 컴포넌트 (사이드바용 - 간소화)
 */
const VoteCard = ({ vote, onClick }) => {
  const isExpired = new Date(vote.finishTime) < new Date();
  const daysLeft = Math.ceil(
    (new Date(vote.finishTime) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
          {vote.title}
        </h4>
        <ChevronRight
          size={16}
          className="text-gray-400 group-hover:text-blue-500 flex-shrink-0"
        />
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{vote.voteRange?.length || 0}개 날짜</span>
        </div>
        <div className="flex items-center gap-1">
          <span>👥</span>
          <span>{vote.members?.length || 0}명 참여</span>
        </div>
        <div className="flex items-center gap-1">
          {isExpired ? (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
              마감됨
            </span>
          ) : daysLeft <= 3 ? (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
              D-{daysLeft}
            </span>
          ) : (
            <span className="text-gray-500">
              {new Date(vote.finishTime).toLocaleDateString("ko-KR")} 마감
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeVoteTab;
