import React from "react";
import { useCalendar } from "../../hooks/useCalendar";
import MonthlyGrid from "./MonthlyGrid";
import { useScheduleFilter } from "../../hooks/useScheduleFilter";
const MonthlyPlanner = ({
  weeks,
  month,
  setViewMode,
  viewMode,
  setCurrentDate,
  year,
  scFilter,
}) => {
  console.log("저 여기에 잇어요");
  const calendar = useCalendar();
  //  const scFilter = useScheduleFilter(currentDate, nowPlanner);
  //얘를 보내야됨
  return (
    //플래너 페이지 전체
    <div className="mt-4 mx-8">
      {/*weekNames관련

      <div className="gap-4 grid grid-cols-7 p-2 text-center">
        {weekNames.map((wn, k) => (
          <div key={k} className="">
            {wn}
          </div>
        ))}
      </div>*/}
      <MonthlyGrid
        weeks={weeks}
        month={month}
        totalDateStyle={`
    relative p-4 border border-gray-100 min-h-[120px] 
    hover:bg-gray-100
    bg-white shadow-sm
  `}
        setViewMode={setViewMode}
        roleofClick={() => setViewMode("daily")}
        setCurrentDate={setCurrentDate}
        onDateClick={(day) => {
          setViewMode("daily");
          setCurrentDate(day);
        }}
        currentMonthStyle={`text-gray-900 bg-white`}
        ncMonthStyle={`
    text-gray-400 bg-gray-50 
    hover:bg-gray-100 
    opacity-70
  `}
        weekNames={calendar.weekNames}
        previewMap={scFilter.groupedDate}
      />
    </div>
  );
};

export default MonthlyPlanner;
