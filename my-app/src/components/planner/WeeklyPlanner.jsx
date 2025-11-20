import React, { useMemo } from "react";
import { Clock, MapPin } from "lucide-react";
import { usePlannerContext } from "../../hooks/PlannerContext";

const WeeklyPlanner = ({
  onDateClick,
  schedules, // props로 받기
}) => {
  const {
    weeks,
    weekFound,
    weekNames,
    openScModal,
    setOpenScModal,
    setSelectedSc,
  } = usePlannerContext();

  const thisweeks = weeks[weekFound];

  // 날짜별로 그룹화하고 라벨 추가 (useMemo로 최적화)
  const weekScheTime = useMemo(() => {
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return [];
    }

    // 1. 날짜별로 그룹화
    const grouped = {};

    schedules.forEach((schedule) => {
      const startDate = schedule.startDateTime.slice(0, 10);
      const endDate = schedule.finishDateTime.slice(0, 10);

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

    // 2. 배열로 변환하고 정렬
    const groupedArray = Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        schedules: grouped[date].sort((a, b) =>
          a.startDateTime.localeCompare(b.startDateTime)
        ),
      }));

    // 3. 라벨 추가
    return groupedArray.map((dayObj) => ({
      ...dayObj,
      schedules: dayObj.schedules.map((schedule) => {
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
  }, [schedules]);

  return (
    <div className="mt-4 mx-8">
      <div className="grid-cols-7 grid p-2">
        {/* 요일 헤더 */}
        {weekNames.map((wn, k) => (
          <div key={k} className="text-gray-900 font-semibold text-center mb-2">
            {wn}
          </div>
        ))}

        {/* 날짜별 일정 표시 */}
        {thisweeks.map((day, d) => {
          const dateKey = `${day.getFullYear()}-${String(
            day.getMonth() + 1
          ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

          const dayObj = weekScheTime.find((d) => d.date === dateKey);
          const daySchedules = dayObj ? dayObj.schedules : [];

          return (
            <div
              key={d}
              // onClick={() => onDateClick(day)}
              className="bg-white p-3 border border-gray-200 min-h-[600px] hover:bg-gray-50"
            >
              <div>{day instanceof Date ? day.getDate() : day}</div>
              <div className="flex flex-col gap-2 mt-2">
                {daySchedules.map((sc, idx) => (
                  <button
                    key={sc.scheduleId || sc.id || idx}
                    className="text-sm px-2 py-1 rounded truncate text-left"
                    style={{
                      backgroundColor: sc.category?.color || "#E5E7EB",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenScModal(true);
                      setSelectedSc(sc.scheduleId || sc.id);
                    }}
                  >
                    {sc.title}

                    <h3 className="text-xs mt-2 text-gray-900 gap-2">
                      <div className="flex gap-1 align-middle">
                        <Clock size={14} />
                        {sc.label}
                      </div>{" "}
                      {sc.location && (
                        <div className="flex gap-1 mt-1">
                          <MapPin size={14} />
                          {sc.location}
                        </div>
                      )}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
