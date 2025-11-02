import React, { useState, useEffect } from "react";
import { useScheduleFilter } from "../../hooks/useScheduleFilter";
import { Clock, MapPin } from "lucide-react";
const ScheduleListSidebar = ({
  className = "",
  openScModal,
  setOpenScModal,
  selectedSc,
  setSelectedSc,
  filtering,
}) => {
  const todaySc = filtering.scTodayFiltered;

  //null값-> 일정 없는 경우.에 대해서도 코딩 필요함

  //1. 사이드바
  //2. 월간
  //3. 주간
  //4. 일간

  {
    /**
     *
     * {date: '2025-08-06', schedules: Array(1)} 이런 구조의 객체임
     *
     * -> array안에는 id, title,시작 시간, 끝나는 시간이 있음
     * 21일 12시 시작
     * 지금 시각 -> 21일 9시
     * 21일 0시 >21일 12시-> 아님
     * 21일 0시 <=
     * 시작 시간이랑 저장된 date 비교(날짜 비교)-> 시작날짜보다 현재날짜가 늦으면 바로 2번으로.
     * 1. 현재 시각과 비교 -> 현재시각<= 배열시각 --> 시작 시간 보여줌
     * 2. 현재시각 > 배열시각 --> 끝나는 시간 보여줌-> 끝나는 날짜가 현재 date와 불일치 시
     * 2-1. 오늘 하루 종일
     * 2-2. 내일 **시까지
     * 2-3. **일 **시까지.
     * 이 중에서 골라서 넣자
     * 근데 2-3은 어차피 먼슬리에 시각화하면 문제 없으니 2-1이나 바로 바로 다음날이면 2-2로 표기해줘도 될듯
     * 시작 시간을 뒤에서 slice해서 보여줌
     *
     */
  }

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
              key={schedule.id}
              className="p-3 grid-rows-2  bg-rose-300 rounded-xl"
              onClick={() => {
                setOpenScModal(true);
                setSelectedSc(schedule.id);
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
{
  /**
  
   
    */
}
