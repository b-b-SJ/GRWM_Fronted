import React from "react";
import { useCalendar } from "../../hooks/useCalendar";
import { useScheduleGrouping } from "../../hooks/useScheduleFilter";
import { Clock, MapPin } from "lucide-react";

const WeeklyPlanner = ({
  weeks,
  weekFound,
  setViewMode,
  onDateClick,
  openScModal,
  setOpenScModal,
  setSelectedSc,
  selectedSc,
  scFilter,
}) => {
  // 주간 날짜 배열 확인

  const thisweeks = weeks[weekFound];
  const calendar = useCalendar();

  //시작 시간, 끝나는 시간 필요
  //
  const getLabelStartEnd = (groupedArr) => {
    return groupedArr.map((dayObj) => ({
      ...dayObj,
      schedules: dayObj.schedules.map((schedule) => {
        // label 만드는 로직 (예시)
        const now = dayObj.date;
        const sdt = schedule.startDateTime;
        const edt = schedule.finishDateTime;
        let label = "";

        label =
          now === sdt.slice(0, 10) && now === edt.slice(0, 10)
            ? `${sdt.slice(11, 16)} ~ ${edt.slice(11, 16)}`
            : now === sdt.slice(0, 10)
            ? `${sdt.slice(11, 16)}~`
            : now === edt.slice(0, 10)
            ? `~${edt.slice(11, 16)}`
            : `-`;

        return {
          ...schedule,
          label,
        };
      }),
    }));
  };

  const weekScheTime = scFilter.groupedDate
    ? getLabelStartEnd(scFilter.groupedDate)
    : [];

  return (
    <div className="mt-4 mx-8">
      {/* 전체에 대한 거 - 공백 만들기 */}
      <div className=" grid-cols-7 grid p-2 ">
        {calendar.weekNames.map((wn, k) => (
          <div key={k} className=" text-gray-900 font-semibold text-center">
            {/* 스타일 필요 -> 요일 이름들 나오는 거 */}
            {wn}
          </div>
        ))}

        {thisweeks.map((day, d) => {
          const dateKey = `${day.getFullYear()}-${String(
            //자꾸 밀려서 toISOString을 쓸 수가 없음요
            day.getMonth() + 1
          ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`; //2023-02-23 형태로 반환

          const dayObj = Array.isArray(weekScheTime) //오류 방지
            ? weekScheTime.find((d) => d.date === dateKey)
            : undefined;
          const daySchedules = dayObj ? dayObj.schedules : [];

          return (
            <div
              key={d}
              onClick={() => onDateClick(day)}
              className="p-3 border border-gray-200 min-h-[600px]  hover:bg-gray-50 "
            >
              <div>{day instanceof Date ? day.getDate() : day}</div>
              <div className="flex flex-col gap-2 mt-2">
                {daySchedules.map((sc, idx) => (
                  <button
                    key={idx}
                    className="text-sm px-2 py-1 bg-rose-100 text-rose-700 rounded truncate text-left"
                    onClick={(e) => {
                      e.stopPropagation(); //데일리로 이동안되게끔
                      setOpenScModal(true);
                      setSelectedSc(sc.id);
                    }}
                  >
                    {sc.title}

                    <h3 className="text-xs mt-2 text-gray-900 gap-2">
                      <div className="flex gap-1 align-middle">
                        <Clock size={14} />
                        {sc.label}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <MapPin size={14} />
                        {sc.location}
                      </div>
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
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
        <div>{/* 투두 자리 */}</div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;
