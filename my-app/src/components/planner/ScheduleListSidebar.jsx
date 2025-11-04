import React, { useState, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";
const ScheduleListSidebar = ({
  className = "",
  openScModal,
  setOpenScModal,
  selectedSc,
  setSelectedSc,
  todaySc,
}) => {
  //const todaySc = filtering.scTodayFiltered;

  //null값-> 일정 없는 경우.에 대해서도 코딩 필요함

  //1. 사이드바
  //2. 월간
  //3. 주간
  //4. 일간

  const getLabelStartEnd = (sc) => {
    const now = new Date(); //혹시나 재활용할 수 있을까 싶어서 new Date()대신에 new Date(sc.date)를 넣었었는데
    //기본이 9시로 설정 되어있어서 계속 안되더라

    return sc.schedules.map((schedule) => {
      //기존에서 label을 추가한 객체 생성
      const sdt = new Date(schedule.startDateTime);
      const edt = new Date(schedule.finishDateTime);

      let label = "";

      if (now <= sdt) {
        const hour = sdt.getHours();
        const min = sdt.getMinutes() > 0 ? ` ${sdt.getMinutes()}분` : ``;
        label =
          hour > 12
            ? `오후 ${hour - 12}시${min} 시작`
            : `오전 ${hour}시${min} 시작`;
      } else if (now.toDateString() === edt.toDateString()) {
        const hour = edt.getHours();
        const min = edt.getMinutes() > 0 ? ` ${edt.getMinutes()}분` : ``;
        label =
          hour > 12
            ? `오후 ${hour - 12}시${min} 종료`
            : `오전 ${hour}시${min} 종료`;
      } else {
        label = "오늘 하루종일";
      }

      return {
        ...schedule, // 원래 schedule 정보
        label, // 추가된 시간 정보
      };
    });
  };

  // null여부 확인
  const todayScheSideTime = todaySc ? getLabelStartEnd(todaySc) : [];

  return (
    //일단은 사이드바전용이라고 생각하고 코드 짜기
    <div className="rounded-2xl ">
      <div className={`p-3 overflow-y-auto ${className} space-y-3`}>
        {todayScheSideTime && todayScheSideTime.length > 0 ? (
          todayScheSideTime.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className="p-3 grid-rows-2  bg-rose-300 rounded-xl"
              onClick={() => {
                setOpenScModal(true);
                setSelectedSc(schedule.scheduleId);
              }}
            >
              <h3 className="text-md font-medium  mb-2">{schedule.title}</h3>
              <h3 className="flex text-xs text-gray-900 gap-2">
                <div className="flex gap-1">
                  <Clock size={14} />
                  {schedule.label}
                </div>
                <div className="flex gap-1">
                  <MapPin size={14} />
                  {schedule.location}
                </div>
              </h3>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400">
            <div>오늘 일정이 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleListSidebar;
