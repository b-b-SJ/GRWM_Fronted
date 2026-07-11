import React, { useState, useEffect } from "react";
import { X, Users, Check, ChevronLeft } from "lucide-react";
import { useAuth } from "../../../../hooks/AuthContext";
import {
  convertSlotsToDto,
  getTimeSlots,
  getColorByPercentage,
} from "./timeVoteUtils";
import VoterModal from "./VoterModal";

const TimeVoteGrid = ({
  vote,
  mode,
  onSubmitVote,
  onUpdateVote,
  onModeChange,
  onBack,
  isEdited,
  setIsEdited,
}) => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [voterModal, setVoterModal] = useState({
    show: false,
    slotInfo: null,
  });

  const { user } = useAuth();
  const isExpired = new Date(vote.finishTime) < new Date();

  // LocalTime 문자열을 숫자(시간)로 변환
  const parseHourFromLocalTime = (localTimeStr) => {
    if (typeof localTimeStr === "number") {
      return localTimeStr;
    }
    if (typeof localTimeStr === "string") {
      const hour = parseInt(localTimeStr.split(":")[0]);
      return hour;
    }
    return 0;
  };

  //  현재 사용자가 참여 멤버인지 확인
  const isMember = vote.members?.some(
    (member) => member.userId === user?.userId
  );

  const startHour =
    vote.startHour !== undefined ? parseHourFromLocalTime(vote.startHour) : 0;
  const endHour =
    vote.endHour !== undefined ? parseHourFromLocalTime(vote.endHour) : 24;

  const timeSlots = getTimeSlots(startHour, endHour);

  //  vote가 변경되면 selectedSlots 초기화
  useEffect(() => {
    setSelectedSlots([]);
  }, [vote.voteId]); // voteId가 바뀌면 초기화

  // 슬롯 선택/해제 (드래그)
  const toggleSlot = (date, time) => {
    const slotKey = `${date}_${time}`;
    setSelectedSlots((prev) =>
      prev.includes(slotKey)
        ? prev.filter((s) => s !== slotKey)
        : [...prev, slotKey]
    );
  };

  const handleMouseDown = (date, time) => {
    if (mode === "vote" && !isExpired) {
      setIsDragging(true);
      toggleSlot(date, time);
    }
  };

  const handleMouseEnter = (date, time) => {
    if (isDragging) {
      toggleSlot(date, time);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 슬롯 클릭 (결과 보기 모드)
  const handleSlotClick = (date, time, matrixSlot) => {
    if (mode === "view" && matrixSlot?.overlapCount > 0) {
      setVoterModal({
        show: true,
        slotInfo: {
          date,
          time,
          voters: matrixSlot.voters || [],
          count: matrixSlot.overlapCount,
          percentage: matrixSlot.overlapPercentage,
        },
      });
    }
  };

  // 투표 제출
  const handleSubmit = () => {
    if (selectedSlots.length === 0) {
      alert("최소 1개의 시간을 선택해주세요.");
      return;
    }

    const availableDateTimes = convertSlotsToDto(selectedSlots);

    if (mode === "vote" && !isEdited) {
      onSubmitVote(availableDateTimes);
    } else if (mode === "vote" && isEdited) {
      onUpdateVote(availableDateTimes);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">{vote.title}</h2>
          </div>

          <p className="text-sm text-gray-600">
            투표 시간: {String(startHour).padStart(2, "0")}:00 ~{" "}
            {String(endHour).padStart(2, "0")}:00
          </p>
          <p className="text-sm text-gray-600">
            마감: {new Date(vote.finishTime).toLocaleString("ko-KR")}
            {isExpired && <span className="text-red-500 ml-2">(마감됨)</span>}
          </p>

          {/* 참여 멤버 */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              참여 멤버 ({vote.members?.length || 0}명)
            </h3>
            <div className="flex flex-wrap gap-2">
              {vote.members?.map((member) => (
                <span
                  key={member.userId}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {member.nickname || member.username}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 그리드 */}
        <div className="p-6 overflow-x-auto max-h-[435px] overflow-y-auto">
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100 sticky left-0 z-10 min-w-[80px]">
                  시간
                </th>
                {vote.voteRange?.map((date) => (
                  <th
                    key={date}
                    className="border p-2 bg-gray-100 min-w-[100px] text-sm"
                  >
                    {new Date(date).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="border p-2 text-sm bg-gray-50 sticky left-0 z-10 font-medium">
                    {time}
                  </td>
                  {vote.voteRange?.map((date) => {
                    const matrixSlot = vote.matrix?.find(
                      (m) => m.date === date && m.slotStart === time
                    );
                    const slotKey = `${date}_${time}`;
                    const isSelected = selectedSlots.includes(slotKey);

                    return (
                      <td
                        key={slotKey}
                        className={`border p-2 transition-colors ${
                          mode === "view"
                            ? `${getColorByPercentage(
                                matrixSlot?.overlapPercentage || 0
                              )} ${
                                matrixSlot?.overlapCount > 0
                                  ? "cursor-pointer hover:opacity-80"
                                  : ""
                              }`
                            : isSelected
                            ? "bg-blue-500 text-white cursor-pointer"
                            : "bg-white hover:bg-blue-100 cursor-pointer"
                        }`}
                        onClick={() =>
                          mode === "view" &&
                          handleSlotClick(date, time, matrixSlot)
                        }
                        onMouseDown={() => handleMouseDown(date, time)}
                        onMouseEnter={() => handleMouseEnter(date, time)}
                        onMouseUp={handleMouseUp}
                      >
                        {mode === "view" && matrixSlot && (
                          <div className="text-xs text-center font-semibold">
                            {matrixSlot.overlapCount}명
                            <br />({matrixSlot.overlapPercentage.toFixed(0)}%)
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 범례 (결과 보기 모드) */}
        {mode === "view" && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold">득표율:</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gray-100 border"></div>
                <span>0%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-green-200 border"></div>
                <span>~30%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-green-400 border"></div>
                <span>~60%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-green-600 border"></div>
                <span>~90%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-green-800 border"></div>
                <span>90%+</span>
              </div>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="p-6 border-t">
          {mode === "vote" && !isExpired && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEdited(true);
                  handleSubmit();
                }}
                disabled={selectedSlots.length === 0}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                투표 제출하기
              </button>
              <button
                onClick={() => onModeChange("view")}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                결과 보기
              </button>
            </div>
          )}

          {mode === "view" &&
            (!isEdited ? (
              <button
                onClick={() => {
                  setSelectedSlots([]);
                  onModeChange("vote");
                }}
                disabled={isExpired || !isMember}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isExpired
                  ? "마감된 투표"
                  : !isMember
                  ? "투표 대상자가 아닙니다"
                  : "내 투표 제출하기"}
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEdited(true);
                  onModeChange("vote");
                }}
                disabled={isExpired}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isExpired ? "마감된 투표" : "내 투표 수정하기"}
              </button>
            ))}
        </div>
      </div>

      {/* 투표자 정보 모달 */}
      {voterModal.show && (
        <VoterModal
          slotInfo={voterModal.slotInfo}
          onClose={() => setVoterModal({ show: false, slotInfo: null })}
        />
      )}
    </>
  );
};

export default TimeVoteGrid;
