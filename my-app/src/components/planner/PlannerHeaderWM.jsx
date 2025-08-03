import React, { useState } from "react";
import MonthlyPlanner from "./MonthlyPlanner";
import WeeklyPlanner from "./WeeklyPlanner";
//<UserRoundPlus />; //유저 아이콘임
import { ChevronLeft, ChevronRight } from "lucide-react";
import DailyPlanner from "./DailyPlanner";
import dummyImg from "../../img/dummy02.jpg"; //캘린더 사진

const PlannerHeaderWM = ({
  //  wmToggle,
  //inviteUser,
  year,
  month,
  // getDate,
  //  weekNum,
  // weekdays,
  viewMode,
  setViewMode,
  STEP,
  currentDate,
  setCurrentDate,
  weeks,
  currentMonthName,
  currentWeekNum,
  weekFound,
  //weekNames,
  // currentMonthName,
}) => {
  console.log("rrrrr", viewMode);
  //플래너 바꾸는 파트는 일단 뺌

  const [choosePlanner, setChoosePlanner] = useState("default");
  const [viewDate, setViewDate] = useState(new Date());

  const goPrev = () => setCurrentDate((prev) => STEP[viewMode].prev(prev));
  const goNext = () => setCurrentDate((prev) => STEP[viewMode].next(prev));
  // console.log("weeks in header:", weeks);
  const [selectCalendar, setSelectCalendar] = useState(false);
  return (
    //토글 버튼 - monthly, weekly 전환
    <div className="pt-4">
      <div className="mt-2 ml-24 flex items-start p-3 outline outline-gray-800 font-bold rounded-r-3xl rounded-tl-3xl w-fit pl-5 pr-5">
        기여운 게 조은데 우뜩해..♡ 20자
      </div>
      <div className="flex items-center relative">
        <div className="flex items-center gap-7 px-4 outline-gray-700">
          {/* 플래너 전환 
      플래너 바꾸는 그런 건데 아직 어떤 식으로 구현해야될지 모르겟음 백
          로직은 있긴 한데 그냥 모르겟어...;ㅠ*/}
          <div className="relative group inline-block">
            <button
              onClick={() => {
                setSelectCalendar(!selectCalendar);
              }}
              className="w-16 h-16 rounded-full bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: `url(${dummyImg})` }} //캘린더 사진
            ></button>
            <div
              className="absolute left-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg hidden group-hover:block"
              //달력 바꾸는 hover 창 -> 영역 좀 벗어나도 작동해야됨+클릭하면 hover일 때 보이는 거 고정으로 보여야됨
            >
              달력 바꾸미
            </div>
          </div>
          <div className="flex p-1.5 w-fit rounded-2xl text-sm font-bold text-gray-500 outline outline-2 mt-6">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-xl
    ${viewMode === "monthly" ? "bg-blue-400 text-white" : "bg-white"}`}
            >
              monthly
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 rounded-xl
    ${viewMode === "weekly" ? "bg-blue-400 text-white" : "bg-white"}`}
            >
              weekly
            </button>
          </div>
        </div>

        {/* 얘는 그거요 그 뭐냐... 날짜 사이 왔다갔다 하는 거
      
      */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-md font-bold text-gray-500">
            {viewMode === "weekly" //년도
              ? currentMonthName
              : year}
          </span>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => goPrev()} className="  px-3 py-1">
              <ChevronLeft className="hover:bg-gray-100 rounded-md" />
            </button>

            <span className="text-5xl font-bold min-w-100">
              {viewMode === "weekly" ? ( //얘도 useCalendar에서 만든 것처럼 맵핑 방식으로 다시 짜야됨
                currentWeekNum
              ) : (
                <div>
                  {viewMode === "daily"
                    ? currentMonthName + " " + currentDate.getDate()
                    : currentMonthName}
                </div>
              )}
            </span>
            <button onClick={() => goNext()} className=" px-3 py-1">
              <ChevronRight className="hover:bg-gray-100 rounded-md" />
            </button>
          </div>
        </div>
      </div>
      {/*이건 플래너 사이 전환하는 거 */}

      <div>
        {/*화면 전환 -> 밑에 있어야됨요*/}
        {viewMode === "monthly" && (
          <MonthlyPlanner
            weeks={weeks}
            month={month}
            setViewMode={setViewMode}
            viewMode={viewMode}
            setCurrentDate={setCurrentDate}
            year={year}
          />
        )}
        {viewMode === "weekly" && (
          <WeeklyPlanner
            weeks={weeks}
            weekFound={weekFound}
            setViewMode={setViewMode}
            viewMode={viewMode}
            setCurrentDate={setCurrentDate}
            onDateClick={(day) => {
              setViewMode("daily");
              setCurrentDate(day);
            }}
          />
        )}

        {viewMode === "daily" && <DailyPlanner />}
      </div>
    </div>
  );
};

export default PlannerHeaderWM;
