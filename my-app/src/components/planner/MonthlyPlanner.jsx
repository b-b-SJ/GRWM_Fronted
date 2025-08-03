import React from "react";
import { useCalendar } from "../../hooks/useCalendar";
import MonthlyGrid from "./MonthlyGrid";

const MonthlyPlanner = ({
  weeks,
  month,
  setViewMode,
  viewMode,
  setCurrentDate,
  year,
}) => {
  console.log("저 여기에 잇어요");
  const calendar = useCalendar();

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
        totalDateStyle={"p-3 border-2 border-white pb-16 hover:bg-gray-400"}
        setViewMode={setViewMode}
        roleofClick={() => setViewMode("daily")}
        setCurrentDate={setCurrentDate}
        onDateClick={(day) => {
          setViewMode("daily");
          setCurrentDate(day);
        }}
        currentMonthStyle={"text-black bg-gray-200"}
        ncMonthStyle={"bg-gray-300 text-gray-700"}
        weekNames={calendar.weekNames}
      />
    </div>
  );
};

export default MonthlyPlanner;
