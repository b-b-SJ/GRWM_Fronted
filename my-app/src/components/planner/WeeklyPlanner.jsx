import React from "react";
import { useCalendar } from "../../hooks/useCalendar";
const WeeklyPlanner = ({ weeks, weekFound, setViewMode, onDateClick }) => {
  // 주간 날짜 배열 확인

  const thisweeks = weeks[weekFound];
  const calendar = useCalendar();
  return (
    <div className="mt-4 mx-8">
      {/* 전체에 대한 거 - 공백 만들기 */}
      <div className=" grid-cols-7 grid p-2 text-center ">
        {calendar.weekNames.map((wn, k) => (
          <div key={k} className=" text-gray-900 font-semibold">
            {/* 스타일 필요 -> 요일 이름들 나오는 거 */}
            {wn}
          </div>
        ))}
        {thisweeks.map((day, d) => (
          <div
            key={d}
            onClick={() => onDateClick(day)}
            className=" p-3 border border-gray-300 min-h-[500px]  hover:bg-gray-50 "
          >
            {day instanceof Date ? day.getDate() : day}
          </div>
        ))}
      </div>
      {/*<div>
        {weeks.map((week, wi) => (
        <div key={wi} style={{ border: "1px solid red" }}>
          {week.map((day, di) => (
            <span key={di} style={{ marginRight: "10px" }}>
              {day instanceof Date ? day.getDate() : day}
            </span>
          ))}
        </div>
      ))}
    </div>*/}
      <div>{/* 일정 자리 */}</div>
      <div>{/* 투두 자리 */}</div>
    </div>
  );
};

export default WeeklyPlanner;
