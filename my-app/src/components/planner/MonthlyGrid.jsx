import React, { useMemo } from "react";
import { usePlannerContext } from "../../hooks/PlannerContext";

const MonthlyGrid = ({
  totalDateStyle,
  onDateClick,
  currentMonthStyle,
  ncMonthStyle,
  showSchedules = true,
  schedules, // props로 받기
}) => {
  const { weeks, month, weekNames } = usePlannerContext();

  // 날짜별로 그룹화 (useMemo로 최적화)
  const groupedSchedules = useMemo(() => {
    if (!showSchedules || !Array.isArray(schedules) || schedules.length === 0) {
      return [];
    }

    console.log("📅 그룹화 시작, 총 일정 수:", schedules.length);
    const grouped = {};

    schedules.forEach((schedule) => {
      const startDate = schedule.startDateTime.slice(0, 10);
      const endDate = schedule.finishDateTime.slice(0, 10);

      // 일정이 여러 날에 걸쳐있으면 각 날짜에 모두 추가
      for (
        let date = new Date(startDate);
        date <= new Date(endDate);
        date.setDate(date.getDate() + 1)
      ) {
        const dateKey = date.toISOString().slice(0, 10);

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(schedule);
      }
    });

    // 객체를 배열로 변환하고 날짜순 정렬
    const result = Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        schedules: grouped[date].sort((a, b) =>
          a.startDateTime.localeCompare(b.startDateTime)
        ),
      }));

    console.log("📅 그룹화 완료:", result);
    return result;
  }, [schedules, showSchedules]);

  return (
    <div>
      {/* 요일 헤더 */}
      <div className="gap-4 grid grid-cols-7 p-2 text-center text-gray-900 font-semibold">
        {weekNames.map((wn, k) => (
          <div key={k}>{wn}</div>
        ))}
      </div>

      <div className="flex-row">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day, di) => {
              const dateKey = `${day.getFullYear()}-${String(
                day.getMonth() + 1
              ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

              // 해당 날짜의 일정 찾기
              const dayObj = groupedSchedules.find((d) => d.date === dateKey);
              const daySchedules = dayObj ? dayObj.schedules : [];

              return (
                <div
                  key={di}
                  onClick={() => onDateClick(day)}
                  className={`${totalDateStyle} ${
                    day.getMonth() === month ? currentMonthStyle : ncMonthStyle
                  }`}
                >
                  <div>{day instanceof Date ? day.getDate() : day}</div>

                  {/* showSchedules가 true일 때만 일정 표시 */}
                  {showSchedules && (
                    <div className="flex flex-col gap-1 mt-1">
                      {/* 최대 2개의 일정만 표시 */}
                      {daySchedules.slice(0, 2).map((sc, idx) => (
                        <div
                          key={sc.scheduleId || sc.id || idx}
                          className="text-xs px-2 py-1 rounded truncate"
                          style={{
                            backgroundColor: sc.category?.color || "#E5E7EB",
                          }}
                        >
                          {sc.title}
                        </div>
                      ))}

                      {/* 3개 이상의 일정이 있으면 "more" 표시 */}
                      {daySchedules.length > 2 && (
                        <div className="relative group">
                          <div className="text-xs text-gray-500 font-medium px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                            +{daySchedules.length - 2} more
                          </div>

                          {/* 호버 시 나머지 일정 표시 */}
                          <div className="absolute top-full left-0 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <div className="flex flex-col gap-1">
                              {daySchedules.slice(2).map((sc, idx) => (
                                <div
                                  key={sc.scheduleId || sc.id || idx + 2}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                                >
                                  {sc.title}
                                </div>
                              ))}
                            </div>
                            <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyGrid;
