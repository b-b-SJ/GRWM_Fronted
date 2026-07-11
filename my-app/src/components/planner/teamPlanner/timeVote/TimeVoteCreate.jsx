import React, { useState } from "react";
import { X, Calendar, Users, Clock } from "lucide-react";
import { useTeamPlanner } from "../../../../hooks/TeamPlannerProvider";
import { getTimeSlots } from "./timeVoteUtils";

//새로운 시간 투표를 생성하는 컴포넌트
const TimeVoteCreate = ({ onSubmit, onCancel }) => {
  const { members } = useTeamPlanner();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: "",
    voteRange: [], // 선택된 날짜들
    finishTime: "",
    memberIds: [], // 참여할 멤버 ID들
    startHour: 9, // 시작 시간 (기본값: 9시)
    endHour: 18, // 종료 시간 (기본값: 18시)
  });

  // 시간 옵션 생성 (0-24시)
  const hourOptions = Array.from({ length: 25 }, (_, i) => i);

  // 날짜 선택/해제
  const toggleDate = (date) => {
    setFormData((prev) => {
      const dates = [...prev.voteRange];
      const index = dates.indexOf(date);

      if (index > -1) {
        dates.splice(index, 1);
      } else if (dates.length < 5) {
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

  // 시작 시간 변경
  const handleStartHourChange = (hour) => {
    const newStartHour = parseInt(hour);
    setFormData((prev) => ({
      ...prev,
      startHour: newStartHour,
      // 종료 시간이 시작 시간보다 작으면 자동 조정
      endHour: prev.endHour <= newStartHour ? newStartHour + 1 : prev.endHour,
    }));
  };

  // 종료 시간 변경
  const handleEndHourChange = (hour) => {
    const newEndHour = parseInt(hour);
    // 종료 시간은 시작 시간보다 커야 함
    if (newEndHour > formData.startHour) {
      setFormData((prev) => ({ ...prev, endHour: newEndHour }));
    } else {
      alert("종료 시간은 시작 시간보다 늦어야 합니다.");
    }
  };
  // 숫자를 LocalTime 문자열로 변환하는 헬퍼 함수
  const formatToLocalTime = (hour) => {
    return `${String(hour).padStart(2, "0")}:00:00`;
  };

  // 폼 제출
  const handleSubmit = () => {
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
    if (formData.startHour >= formData.endHour) {
      alert("시작 시간은 종료 시간보다 빨라야 합니다.");
      return;
    }
    if (formData.memberIds.length === 0) {
      alert("최소 1명의 팀원이 포함되어야 합니다");
      return;
    }

    //  백엔드 형식에 맞게 데이터 변환
    const requestData = {
      title: formData.title,
      voteRange: formData.voteRange,
      finishTime: formData.finishTime,
      memberIds: formData.memberIds, //소문자로 통일
      startHour: formatToLocalTime(formData.startHour), // "09:00:00"
      endHour: formatToLocalTime(formData.endHour), // "18:00:00"
    };

    onSubmit(requestData);
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

        {/* 시간 범위 설정 */}
        <div>
          <label className="block font-semibold mb-2  items-center gap-2">
            <Clock className="w-5 h-5" />
            투표 시간 범위
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                시작 시간
              </label>
              <select
                value={formData.startHour}
                onChange={(e) => handleStartHourChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hourOptions.slice(0, 23).map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
            <span className="text-gray-500 mt-6">~</span>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                종료 시간
              </label>
              <select
                value={formData.endHour}
                onChange={(e) => handleEndHourChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hourOptions.slice(formData.startHour + 1).map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            선택한 시간: {String(formData.startHour).padStart(2, "0")}:00 ~{" "}
            {String(formData.endHour).padStart(2, "0")}:00 (
            {formData.endHour - formData.startHour}시간)
          </p>
        </div>

        {/* 날짜 선택 */}
        <div>
          <label className="block font-semibold mb-2  items-center gap-2">
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
          <label className="block font-semibold mb-2  items-center gap-2">
            <Users className="w-5 h-5" />
            참여 멤버 선택<span className="text-red-500">*</span>
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
