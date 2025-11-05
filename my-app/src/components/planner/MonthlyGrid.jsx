import react from "react";
//import DailyPlanner from "./DailyPlanner";
import { usePlannerContext } from "../../hooks/PlannerContext";

const MonthlyGrid = ({
  totalDateStyle,
  onDateClick,
  currentMonthStyle,
  ncMonthStyle,

  previewMap, //오류 생길 가능성 다분 - 지금 스케쥴 관한 거를 받고 있는 게 따로 없어서..
  //근데 또 전에 유효성 검사한 거 때문에 또 ㄱㅊ을 지도
}) => {
  const today = new Date();
  const { weeks, month, weekNames, setViewMode, setCurrentDate } =
    usePlannerContext();
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
            {week.map((day, di) => {
              const dateKey = `${day.getFullYear()}-${String(
                //자꾸 밀려서 toISOString을 쓸 수가 없음요
                day.getMonth() + 1
              ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`; //2023-02-23 형태로 반환

              const dayObj = Array.isArray(previewMap) //오류 방지
                ? previewMap.find((d) => d.date === dateKey)
                : undefined;
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
                  <div className="flex flex-col gap-1 mt-1">
                    {daySchedules.slice(0, 2).map((sc, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded truncate"
                      >
                        {sc.title}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="relative group">
                        <div className="text-xs text-gray-500 font-medium px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                          +{daySchedules.length - 2} more
                        </div>

                        {/* like 더보기 */}
                        <div className="absolute top-full left-0 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <div className="flex flex-col gap-1">
                            {daySchedules.slice(2).map((sc, idx) => (
                              <div
                                key={idx + 2}
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
                </div>
              );

              {
                /*
                //오늘 날짜 표시 만들어본 건데 맘에 안 들어서 버릴거임
                {day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear() && (
                  <div className="top-0 right-0 w-2 h-2 bg-blue-400 rounded-full"></div> //아오 마음에 안들어;;;;;;;;;
                )}*/
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyGrid;
