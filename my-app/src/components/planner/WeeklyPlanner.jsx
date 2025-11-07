import React, { useState, useEffect, useCallback } from "react";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import { Clock, MapPin } from "lucide-react";
import { usePlannerContext } from "../../hooks/PlannerContext";
import { useParams } from "react-router-dom";

const WeeklyPlanner = ({ onDateClick }) => {
  // Context에서는 UI 관련 상태랑 날짜 정보만 가져옴
  const {
    weeks,
    weekFound,
    weekNames,
    currentDate,
    openScModal,
    setOpenScModal,
    setSelectedSc,
    plannerType,
  } = usePlannerContext();

  // API 호출 함수 가져오기
  const { fetchWeeklySchedules } = useCurrentPlanner(plannerType);

  // URL에서 plannerId 가져오기
  const { plannerId } = useParams();

  // 이 컴포넌트에서만 사용할 스케줄 데이터 관리
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const thisweeks = weeks[weekFound];

  //  주 번호 계산 함수
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // 날짜별로 그룹화하는 함수
  const groupSchedulesByDate = useCallback((scheduleList) => {
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
    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        schedules: grouped[date].sort((a, b) =>
          a.startDateTime.localeCompare(b.startDateTime)
        ),
      }));
  }, []);

  // 📌 주별 일정 불러오기
  useEffect(() => {
    const loadSchedules = async () => {
      if (!plannerId || !currentDate) return;

      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const weekNumber = getWeekNumber(currentDate);

        console.log(`주별 일정 조회 시작: ${year}년 ${weekNumber}주`);
        const data = await fetchWeeklySchedules(plannerId, year, weekNumber);

        console.log("받아온 데이터:", data);
        setSchedules(groupSchedulesByDate(data || []));
      } catch (error) {
        console.error("주별 일정 조회 실패:", error);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    console.log("주간 일정", schedules);
    loadSchedules();
  }, [plannerId, currentDate, fetchWeeklySchedules, groupSchedulesByDate]);

  // 시작 시간, 끝나는 시간 표시용 라벨 생성
  const getLabelStartEnd = (groupedArr) => {
    return groupedArr.map((dayObj) => ({
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
  };

  // schedules에 라벨 추가
  const weekScheTime = schedules.length > 0 ? getLabelStartEnd(schedules) : [];

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="mt-4 mx-8 text-center py-10">
        <div className="text-gray-500">일정을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="mt-4 mx-8">
      <div className="grid-cols-7 grid p-2">
        {/* 요일 헤더 */}
        {weekNames.map((wn, k) => (
          <div key={k} className="text-gray-900 font-semibold text-center">
            {wn}
          </div>
        ))}

        {/* 날짜별 일정 표시 */}
        {thisweeks.map((day, d) => {
          const dateKey = `${day.getFullYear()}-${String(
            day.getMonth() + 1
          ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

          const dayObj = Array.isArray(weekScheTime)
            ? weekScheTime.find((d) => d.date === dateKey)
            : undefined;
          const daySchedules = dayObj ? dayObj.schedules : [];

          return (
            <div
              key={d}
              onClick={() => onDateClick(day)}
              className="p-3 border border-gray-200 min-h-[600px] hover:bg-gray-50"
            >
              <div>{day instanceof Date ? day.getDate() : day}</div>
              <div className="flex flex-col gap-2 mt-2">
                {daySchedules.map((sc, idx) => (
                  <button
                    key={sc.scheduleId || sc.id || idx}
                    className="text-sm px-2 py-1 bg-rose-100 text-rose-700 rounded truncate text-left"
                    onClick={(e) => {
                      e.stopPropagation(); // 데일리로 이동 방지
                      setOpenScModal(true);
                      setSelectedSc(sc.scheduleId || sc.id); // API 응답 구조에 맞게
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
      </div>
    </div>
  );
};

export default WeeklyPlanner;
