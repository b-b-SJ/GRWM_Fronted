import react from "react";
//import DailyPlanner from "./DailyPlanner";

const MonthlyGrid = ({
  weeks,
  month,
  totalDateStyle,
  setViewMode,
  // roleofClick,
  setCurrentDate,
  onDateClick,
  currentMonthStyle,
  ncMonthStyle,
  weekNames,
}) => {
  const today = new Date();
  console.log(weeks);
  return (
    <div>
      {/**요일 배열 */}
      <div className="gap-4 grid grid-cols-7 p-2 text-center text-gray-900 font-semibold">
        {weekNames.map((wn, k) => (
          <div key={k} className="">
            {wn}
          </div>
        ))}
      </div>
      <div className="flex-row">
        {/*^위에 className은 캘린더 전체 기중 */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 ">
            {/*달력 세로 줄*/}
            {week.map((day, di) => (
              <div
                key={di}
                onClick={() => {
                  onDateClick(day);
                }}
                className={`${totalDateStyle}   ${
                  //오늘 날짜 강조 표시 필요
                  //calendar-day
                  //현재 날짜면 오버레이?로 스타일링 필요
                  day.getMonth() === month ? currentMonthStyle : ncMonthStyle
                } `}
              >
                {day instanceof Date ? day.getDate() : day}

                {/*
                //오늘 날짜 표시 만들어본 건데 맘에 안 들어서 버릴거임
                {day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear() && (
                  <div className="top-0 right-0 w-2 h-2 bg-blue-400 rounded-full"></div> //아오 마음에 안들어;;;;;;;;;
                )}*/}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyGrid;
