// VoterModal.jsx
import React from "react";
import { X, Users } from "lucide-react";

/**
 * 특정 시간대에 투표한 사람들을 보여주는 모달
 */
const VoterModal = ({ slotInfo, onClose }) => {
  if (!slotInfo) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold">투표자 정보</h3>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(slotInfo.date).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}{" "}
              {slotInfo.time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 통계 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-900">
            <Users className="w-5 h-5" />
            <span className="font-semibold">
              {slotInfo.count}명이 투표 ({slotInfo.percentage.toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* 투표한 멤버 목록 */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            투표한 멤버:
          </p>
          {slotInfo.voters.map((voter) => (
            <div
              key={voter.userId}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              {/* 프로필 이미지 또는 이니셜 */}
              {voter.profileImage ? (
                <img
                  src={voter.profileImage}
                  alt={voter.nickname}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                  {(voter.nickname || voter.username).charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium">
                {voter.nickname || voter.username}
              </span>
            </div>
          ))}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default VoterModal;
