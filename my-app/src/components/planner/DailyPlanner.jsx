import React from "react";
//import { useCalendar } from "../../hooks/useCalendar";
import { useScheduleGrouping } from "../../hooks/useScheduleFilter";

const DailyPlanner = ({
  openScheduleModal,
  setOpenScheduleModal,
  currentDate,
  scFilter,
}) => {
  //시간을 격자로 나타냄.-> 걍 시간을 다 네머네모로 하기.
  //설정된 start 시간을 가져옴. -> start시간 부터 끝까지.
  //14일 7시 시작이면 날의 끝은 15일 6시 -> 이런 식으로
  //currentDate에 해당되는 일정을 보여줌

  const getLabelnStyleStartEnd = (dayObj) => {
    return {
      //라벨 -> 언제까지인지 나타날 때 씀
      //stylrType -> 표시하는 거 ->> 스타일링할 때 씀
      ...dayObj,
      schedules: dayObj.schedules.map((schedule) => {
        // label 만드는 로직 (예시)
        const now = dayObj.date;
        const sdt = schedule.startDateTime;
        const edt = schedule.finishDateTime;
        let label = "";
        let styleType = "normal";

        if (now === sdt.slice(0, 10) && now === edt.slice(0, 10)) {
          label = `${sdt.slice(11, 16)} ~ ${edt.slice(11, 16)}`;
        } else if (now === sdt.slice(0, 10)) {
          label = `${sdt.slice(11, 16)}~`;
          styleType = "continue";
        } else if (now === edt.slice(0, 10)) {
          label = `~${edt.slice(11, 16)}`;
          styleType = "ending";
        } else {
          label = ``;
          styleType = "allDay";
        }

        return {
          ...schedule,
          label,
          styleType,
        };
      }),
    };
  };

  //currentDate로 불려온 애들-> 오늘 이상이면 어쩌고~ 위클리랑 사이드바?에서 썻던 논리 가져와서 재활용-> 까는 거 때문에
  //만약 일정이 하루 종일이면 -> 맨 위에 종일 일정으로 별도 표시
  //만약 일정이 같은 시간대에 겹쳐서 존재한다면 -> 일정 블록 가로 크기를 줄임

  //이걸 사용해서 일정 보여주기
  //currentDate에 해당하는 날짜랑 매칭-> 해당 날짜에 해당되는 일정만 보여주면됨.
  //일단 해당 일정 출력부터 해내고, 그 다음에 그리드 내가지고 어쩌고저꺼고를 해야겟음

  //욘나 복잡해 지기 땜에 그냥 당일 스케쥴만 보여주고 처음 시작은 대충 7시부터 해야겟음;;
  // -> 따로 앞에 스케쥴 없으면 접기로 숨길것
  //일정을 시간 안으로 넣을 필요가 있음

  const getTimeTable = () => {
    const nowDate = new Date();
    //nowDate에서 시간을 뽑아서 보여줌?
    const timeTb = [];
    for (let h = 0; h < 24; h++) {
      timeTb.push(`${h} : 00`);
    }
    return timeTb;
  }; //timeTable에다가 들억ㄹ 것들을
  const timeTable = getTimeTable();
  //시간표 출력, 그 위에 일정 덮기-> 날짜 정보값에 따라
  //기본 설정 -> 0시~ 6시는 특별 일정 없으면 접어둠-> 일정 설정하면 자동으로 펼쳐짐.
  const filtered = scFilter?.scDateFiltered
    ? getLabelnStyleStartEnd(scFilter.scDateFiltered)
    : null;

  const dateSchedules = filtered?.schedules || [];

  //종일 일정들 걸러내는 필터링 함수 필요

  return (
    <div className=" flex flex-col">
      {/* 위에 나와 있는 거 */}
      <div className="mt-6 mx-9 grid grid-cols-[12fr_9fr_10fr] ">
        <span>timetable</span>
        <span>메모+상세 일정</span>
        <span>투두리스트</span>
      </div>

      <div className="mt-2 mx-9 grid grid-cols-[12fr_9fr_10fr] h-[600px]">
        {/* 타임테이블 + 일정*/}
        <div className="">
          <div className="bg-green-300">하루죙일있는 거</div>
          <div className="h-[600px] overflow-y-auto">
            <div className=" border bg-blue-400 flex flex-col h-full ">
              {/*이건 시간표 레이아웃*/}
              <div className="flex-1 ">
                {timeTable.map((time, index) => (
                  <div
                    key={index}
                    className="border-t top-2 left-1 text-sm text-gray-500 bg-white px-1 flex h-[40px] flex-wrap "
                  >
                    {/* ⬆️지금 이 위에 ㅣㅆ는 타임테이블 px에 따라서 화면에서 overflow가 막 생기고 안생기고가 됨*/}
                    {time}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 mx-8 flex gap-y-4">
              {/* 일정 -> 오버레이로 나타낼 예정 */}
              <div className="">
                {dateSchedules.map((schedule, id) => (
                  <div
                    className={` 
    bg-blue-400 text-white p-2 mb-3 
    ${schedule.styleType === "continue" ? "rounded-t-lg" : ""}
    ${schedule.styleType === "ending" ? "rounded-b-lg " : ""}
    ${schedule.styleType === "allDay" ? "absolute top-4" : ""}
  `} //
                  >
                    {schedule.title}
                    {/**
                     * 스타일링하면 되겟긔
                     */}
                  </div>
                ))}
              </div>
            </div>
            .
          </div>
        </div>

        {/* 여기부터는 다른 파트 -> 메모+상세페이지, 투두*/}

        <div className=" overflow-y-auto border bg-rose-300">어쩌고</div>

        <div className=" overflow-y-auto border bg-yellow-400"></div>
      </div>
    </div>
  );
};

export default DailyPlanner;
