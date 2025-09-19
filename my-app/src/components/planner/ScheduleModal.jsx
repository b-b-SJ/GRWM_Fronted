import React, { useState } from "react";
import { useScheduleFilter } from "../../hooks/useScheduleFilter";

import {
  MapPin,
  Pencil,
  // NotebookPen,
  X,
  NotepadText,
  Clock,
  Clock2,
} from "lucide-react";
const ScheduleModal = ({
  openScModal,
  setOpenScModal,
  selectedSc,
  setSelectedSc,
  scFilter,
}) => {
  //일정 추가든, 일정 상세 조회든 모달 구조를 정확히 파악하고 어케 잘 이해하고 있어야 구현 진행이 가능함(에휴)

  if (!openScModal) return null;

  const sSchedule = scFilter.getselectedSchedule(
    selectedSc,
    scFilter.scPlannerFiltered
  ); //잘 작동함.->

  const backDropClickscm = (e) => {
    if (e.target === e.currentTarget) {
      setOpenScModal(false);
    }
  };
  const renderTime = (timeString) => {
    const time = new Date(timeString);
    return `${time.getFullYear()}년 ${
      time.getMonth() + 1
    }월 ${time.getDate()}일  ${timeString.slice(11, 16)}`; //ㅅㅈㅎ 마음에 안 듦ㅠㅠㅠㅠㅠ
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop"
      onClick={backDropClickscm} //그냥 뒤에 눌러도 꺼짐
    >
      {/**
  id: 1,
      title: "회의",
      startDateTime: "2025-07-21T10:00:00",
      finishDateTime: "2025-07-21T11:00:00",
      location: "집",
      memo: "늦지 말기!",
  */}
      <div
        className="bg-white p-6 rounded-lg max-w-lg mx-auto mt-48"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="relative space-y-2 mx-2">
          <X
            className="absolute cursor-pointer -right-2.5 -top-4 " //오른쪽으로..
            onClick={() => setOpenScModal(false)}
          />
          <div className="">
            <h1 className="font-medium text-sm text-gray-700">
              (카테고리 자리)
            </h1>
            <h1 className="font-bold text-2xl">{sSchedule.title}</h1>

            <div className=" text-md space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <Clock size={17} />
                <h2 className="font-medium">시작 시간:</h2>
                {renderTime(sSchedule.startDateTime)}
              </div>
              <div className="flex items-center gap-2">
                <Clock2 size={17} />
                <h2 className="font-medium">끝나는 시간:</h2>
                {renderTime(sSchedule.finishDateTime)}
              </div>

              <div className="flex items-center gap-2 ">
                <MapPin size={18} />
                <h2 className="font-medium">장소:</h2>
                {sSchedule.location}
              </div>
              {sSchedule.memo && (
                <div className="flex items-center gap-2">
                  <NotepadText size={18} />
                  <h3 className="font-medium">메모:</h3>
                  {sSchedule.memo}
                </div>
              )}
              <div className="flex justify-end">
                <button className="flex items-center gap-2">
                  수정하기
                  <Pencil size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScheduleModal;

{
  /* 일정 상세 모달 (selectedEvent가 있을 때만 표시)
  selectedEvent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">일정 상세</h3>
      <div className="space-y-2">
        <p>
          <strong>제목:</strong> {selectedEvent.title}
        </p>
        {selectedEvent.time && (
          <p>
            <strong>시간:</strong> {selectedEvent.time}
          </p>
        )}
        {selectedEvent.location && (
          <p>
            <strong>장소:</strong> {selectedEvent.location}
          </p>
        )}
        {selectedEvent.category && (
          <p>
            <strong>카테고리:</strong> {selectedEvent.category}
          </p>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setSelectedEvent(null)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
);
  
  */
}
