// TimeVoteCreate.jsx
import React, { useState } from "react";
import { X, Calendar, Users } from "lucide-react";
import { useTeamPlanner } from "../../../../hooks/TeamPlannerProvider";

/**
 * 새로운 시간 투표를 생성하는 컴포넌트
 */
const TimeVoteCreate = ({ onSubmit, onCancel }) => {
  const { members } = useTeamPlanner();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: "",
    voteRange: [], // 선택된 날짜들
    finishTime: "",
    memberIds: [], // 참여할 멤버 ID들
  });

  // 날짜 선택/해제
  const toggleDate = (date) => {
    setFormData((prev) => {
      const dates = [...prev.voteRange];
      const index = dates.indexOf(date);

      if (index > -1) {
        // 이미 선택된 날짜면 제거
        dates.splice(index, 1);
      } else if (dates.length < 5) {
        // 최대 5개까지만 추가
        dates.push(date);
      } else {
        alert("날짜는 최대 5개까지 선택 가능합니다.");
        return prev;
      }

      return { ...prev, voteRange: dates.sort() };
    });
  };

  // 멤버 선택/해제
  const toggleMember = (memberId) => {
    setFormData((prev) => {
      const ids = [...prev.memberIds];
      const index = ids.indexOf(memberId);

      if (index > -1) {
        ids.splice(index, 1);
      } else {
        ids.push(memberId);
      }

      return { ...prev, memberIds: ids };
    });
  };

  // 폼 제출
  const handleSubmit = () => {
    // 필수 항목 검증
    if (!formData.title.trim()) {
      alert("투표 제목을 입력해주세요.");
      return;
    }
    if (formData.voteRange.length === 0) {
      alert("최소 1개의 날짜를 선택해주세요.");
      return;
    }
    if (!formData.finishTime) {
      alert("마감 시간을 설정해주세요.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-bold">새 시간 투표 만들기</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* 제목 입력 */}
        <div>
          <label className="block font-semibold mb-2">
            투표 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 팀 미팅 시간 정하기"
          />
        </div>

        {/* 날짜 선택 */}
        <div>
          <label className="block font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            투표 날짜 선택 (최대 5일) <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            onChange={(e) => e.target.value && toggleDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* 선택된 날짜 표시 */}
          {formData.voteRange.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.voteRange.map((date) => (
                <span
                  key={date}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2 text-sm"
                >
                  {new Date(date).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                  <X
                    className="w-4 h-4 cursor-pointer hover:text-blue-600"
                    onClick={() => toggleDate(date)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 마감 시간 */}
        <div>
          <label className="block font-semibold mb-2">
            마감 시간 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.finishTime}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, finishTime: e.target.value }))
            }
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 참여 멤버 선택 */}
        <div>
          <label className="block font-semibold mb-2 flex items-center gap-2">
            <Users className="w-5 h-5" />
            참여 멤버 선택
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {members.map((member) => (
              <label
                key={member.userId}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.memberIds.includes(member.userId)}
                  onChange={() => toggleMember(member.userId)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  {member.nickname || member.username}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            투표 생성하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeVoteCreate;
