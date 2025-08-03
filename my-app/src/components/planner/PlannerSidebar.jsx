import React, { useState, useEffect } from "react";
import TodoList from "./TodoList";
import ScheduleList from "./ScheduleList";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MonthlyGrid from "./MonthlyGrid";
import { useCalendar } from "../../hooks/useCalendar";

const PlannerSidebar = ({
  viewMode = { viewMode },
  //year = { year },
  // month = { month },
  currentDate = { currentDate },
  setCurrentDate = { setCurrentDate },
  weeks = { weeks },
  setViewMode = { setViewMode },
  weekNames = { weekNames },
}) => {
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [todoOpen, setTodoOpen] = useState(true);
  const [tempDate, setTempDate] = useState(currentDate);
  //console.log("plannerSidebar", viewMode);
  //const prevMonth = new Date(tempDate);
  //const nextMonth = new Date(tempDate);
  const sideDate = new Date(tempDate);
  const calendar = useCalendar();

  //useCalendar에서 직접 그냥 가져옴; - 메인 캘린더랑 분리를 위해서
  const firstDayOfMonth = new Date(
    tempDate.getFullYear(),
    tempDate.getMonth(),
    1
  );
  console.log("먀", firstDayOfMonth);
  const lastDayOfMonth = new Date(
    tempDate.getFullYear(),
    tempDate.getMonth() + 1,
    0
  );
  console.log("듀", lastDayOfMonth);
  //월요일기준정렬
  const setMonday = (firstDayOfMonth.getDay() + 6) % 7;
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(1 - setMonday); //startDay 변경

  const endDay = new Date(lastDayOfMonth);
  const remaining = 6 - ((lastDayOfMonth.getDay() + 6) % 7);
  endDay.setDate(endDay.getDate() + remaining);

  //날짜 바꾸미
  const goPrev = () => {
    sideDate.setMonth(sideDate.getMonth() - 1);
    setTempDate(sideDate);
  };
  const goNext = () => {
    sideDate.setMonth(sideDate.getMonth() + 1);
    setTempDate(sideDate);
  };

  const sideWeeks = calendar.groupDatesByWeek(startDay, endDay);

  //메인 플래너 날짜가 바뀌면 따라감
  useEffect(() => {
    setTempDate(currentDate);
  }, [currentDate]);

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      <div>
        {(viewMode === "daily" || viewMode === "weekly") && (
          <div className="p-4 shadow-sm shadow-gray-200">
            {/**왔다갔다만 하고 선택전까지는 날짜 안바뀜 */}
            <div className="flex justify-center mb-2">
              {/**이 위에서 정렬관리*/}
              <button onClick={() => goPrev()}>
                <ChevronLeft className="hover:bg-gray-200 rounded-md" />
              </button>
              <h1 className="mx-4 text-xl font-semibold">
                {sideDate.getFullYear()}. {sideDate.getMonth() + 1}
              </h1>
              <button onClick={() => goNext()}>
                <ChevronRight className="hover:bg-gray-200 rounded-md" />
              </button>
            </div>
            <MonthlyGrid
              weeks={sideWeeks}
              month={tempDate.getMonth()}
              //viewMode={viewMode}
              setViewMode={setViewMode}
              setCurrentDate={setCurrentDate}
              weekNames={weekNames}
              totalDateStyle={
                "p-2 hover:rounded-full focus:outline-rose-200 text-center hover:bg-gray-100"
              }
              currentMonthStyle={"text-gray-800"}
              ncMonthStyle={
                "text-gray-300"
                //지금 월아닐때
              }
              onDateClick={(day) => {
                setCurrentDate(day);
                // setViewMode("daily");
              }}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-none text-left">
        <button
          onClick={() => setScheduleOpen(!scheduleOpen)}
          className={` py-2.5 p-2 text-md text-left font-bold flex  shadow-sm shadow-gray-200
    ${scheduleOpen ? "" : "hover:bg-gray-200"}`}
        >
          오늘의 일정
          <ChevronDown
            size={20}
            className={`mt-1 ml-auto transition-transform ${
              scheduleOpen ? "" : "scale-y-[-1]"
            }`}
          />
        </button>
        {scheduleOpen === true && (
          <ScheduleList className="max-h-60 min-h-60" />
        )}

        {/*todo 오늘 것만 나오도록 손봐야됨*/}
        <button
          onClick={() => setTodoOpen(!todoOpen)}
          className={`py-2.5 p-2 text-md text-left font-bold flex  shadow-sm shadow-gray-200
    ${todoOpen ? "" : "hover:bg-gray-200"}`}
        >
          오늘의 todo
          <ChevronDown
            size={20}
            className={`mt-1 ml-auto transition-transform ${
              todoOpen ? "" : "scale-y-[-1]"
            }`}
          />
        </button>
        {/**나중에 공간 늘리면 됨 */}
        <div className=" ">
          {todoOpen === true && <TodoList className="max-h-60 min-h-60" />}
        </div>
      </div>
    </div>
  );
};

// ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
export default PlannerSidebar;
