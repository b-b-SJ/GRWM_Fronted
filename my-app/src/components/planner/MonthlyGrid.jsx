import React, { useState, useEffect, useCallback } from "react";
import { usePlannerContext } from "../../hooks/PlannerContext";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import { useParams } from "react-router-dom";

const MonthlyGrid = ({
  totalDateStyle,
  onDateClick,
  currentMonthStyle,
  ncMonthStyle,
  showSchedules = true, // 일정 표시 여부 (기본값: true)
}) => {
  // Context에서 UI 관련 상태만 가져오기
  const { weeks, month, year, weekNames, currentDate, plannerType } =
    usePlannerContext();

  const { fetchMonthlySchedules } = useCurrentPlanner(plannerType);

  // URL에서 plannerId 가져오기
  const { plannerId } = useParams();

  //  스케줄 데이터 관리
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // 날짜별로 그룹화하는 함수
  const groupSchedulesByDate = useCallback((scheduleList) => {
    if (!Array.isArray(scheduleList) || scheduleList.length === 0) {
      console.log("📅 그룹화할 일정이 없음");
      return [];
    }

    console.log("📅 그룹화 시작, 총 일정 수:", scheduleList.length);
    const grouped = {};

    scheduleList.forEach((schedule) => {
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
  }, []);

  // 월별 일정 불러오기 (showSchedules가 true일 때만 실행)
  useEffect(() => {
    // 일정을 표시하지 않으면 fetch 안 함
    if (!showSchedules) {
      console.log("📅 사이드바 모드: 일정 fetch 안 함");
      return;
    }

    const loadSchedules = async () => {
      if (!plannerId || !currentDate || !fetchMonthlySchedules) {
        console.log("📅 필수 값 없음:", {
          plannerId,
          currentDate,
          fetchMonthlySchedules,
        });
        return;
      }

      setLoading(true);
      try {
        const targetYear = currentDate.getFullYear();
        const targetMonth = currentDate.getMonth() + 1;

        console.log(
          ` 월별 일정 조회 시작: ${targetYear}년 ${targetMonth}월, plannerId: ${plannerId}`
        );

        const data = await fetchMonthlySchedules(
          plannerId,
          targetYear,
          targetMonth
        );

        console.log("API 응답 데이터:", data);
        console.log("데이터 타입:", typeof data, Array.isArray(data));

        if (data && data.length > 0) {
          console.log(" 첫 번째 일정 샘플:", data[0]);
        }

        const grouped = groupSchedulesByDate(data || []);
        console.log("그룹화 후 저장할 데이터:", grouped);
        setSchedules(grouped);
      } catch (error) {
        console.error("월별 일정 조회 실패:", error);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [
    plannerId,
    currentDate,
    fetchMonthlySchedules,
    groupSchedulesByDate,
    showSchedules,
  ]);

  // 로딩 중일 때 (일정을 표시할 때만)
  if (loading && showSchedules) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500">일정을 불러오는 중...</div>
      </div>
    );
  }

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

              // 일정을 표시할 때만 해당 날짜의 일정 찾기
              let daySchedules = [];
              if (showSchedules) {
                const dayObj = Array.isArray(schedules)
                  ? schedules.find((d) => d.date === dateKey)
                  : undefined;
                daySchedules = dayObj ? dayObj.schedules : [];
              }

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
                          className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded truncate"
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
                            {/* 화살표 */}
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
