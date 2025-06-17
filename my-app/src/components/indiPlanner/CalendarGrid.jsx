import React from "react";
import { Clock, MapPin } from "lucide-react";

/**
 * CalendarBoard.jsx
 * - 요일 헤더 & 날짜 그리드(셀 클릭 시 일정 선택)
 */

const CalendarGrid = ({
  dates,
  events,
  currentDate,
  viewMode,
  onSelectEvent,
}) => {
  const dayNames = [, "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  //날짜
  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const isCurrentMonth = (date) => date.getMonth() === currentDate.getMonth();
  const getScheduleForDate = (date) => {
    const str = date.toISOString().split("T")[0];
    return events.filter((ev) => ev.date === str);
  };

  return (
    <div className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow-sm border h-full">
        <div className="grid grid-cols-7 border-b">
          {dayNames.map((d, i) => (
            <div
              key={d}
              className={`p-4 text-center font-medium ${
                i === 5
                  ? "text-blue-600"
                  : i === 6
                  ? "text-red-600"
                  : "text-gray-700" //토,일 색깔처리
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          className="grid grid-cols-7"
          style={{ gridTemplateRows: "repeat(6,1fr)" }}
        >
          {dates.map((date, i) => {
            //일정
            const dayEvents = getScheduleForDate(date);
            return (
              <div
                key={i}
                onClick={() => onSelectEvent(date)}
                className={`border-r border-b p-2 cursor-pointer transition-colors ${
                  !isCurrentMonth(date) ? "text-gray-400 bg-gray-50" : ""
                } ${isToday(date) ? "bg-blue-50" : ""}`} //오늘날짜 강조 !! -> 날짜 그리드 폭 지정 아직 안함
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday(date)
                      ? "text-blue-600"
                      : isCurrentMonth(date)
                      ? "text-gray-800"
                      : "text-gray-400"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className={`${ev.color} text-white text-xs px-2 py-1 rounded truncate`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && ( //3개 초과시 +n개더로 표시
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CalendarGrid;
