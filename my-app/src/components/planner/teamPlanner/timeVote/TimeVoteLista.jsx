import React from "react";
import { Clock, Plus } from "lucide-react";

/**
 * 시간 투표 목록을 보여주는 컴포넌트
 */
const TimeVoteList = ({ voteList, onCreateClick, onVoteClick, onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          시간 투표
        </h2>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />새 투표 만들기
        </button>
      </div>

      <div className="p-6">
        {voteList.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">진행 중인 투표가 없습니다.</p>
            <button
              onClick={onCreateClick}
              className="mt-4 text-blue-500 hover:text-blue-600"
            >
              첫 투표 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {voteList.map((vote) => (
              <VoteCard key={vote.id} vote={vote} onClick={onVoteClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 개별 투표 카드 컴포넌트
 */
const VoteCard = ({ vote, onClick }) => {
  const isExpired = new Date(vote.finishTime) < new Date();

  return (
    <div
      onClick={() => onClick(vote)}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{vote.title}</h3>
        {isExpired && (
          <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
            마감됨
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600 mt-2 space-y-1">
        <p>📅 {vote.voteRange?.length || 0}개 날짜</p>
        <p>⏰ 마감: {new Date(vote.finishTime).toLocaleDateString("ko-KR")}</p>
        <p>👥 참여: {vote.members?.length || 0}명</p>
      </div>
    </div>
  );
};

export default TimeVoteList;
