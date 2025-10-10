import { useState } from "react";

export function useCalendar() {
  //currentDate는 사실상 유저가 현재 보고 있는 '날짜'라고 봐도 무관
  const [currentDate, setCurrentDate] = useState(new Date());
  //currentDate에 저장된 '날짜'를 각 년, 월, 일로 나눔
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  //월 이름
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[month];

  //주차
  const weekNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekNums = ["week 1", "week 2", "week 3", "week 4", "week 5"];
  const currentWeekNum = weekNums[Math.floor(day / 7)]; //!!!!!!!!!!!고쳐야더ㅚ나?

  //달력 시작, 끝
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  //월요일기준 정렬을 위한 코드들
  const setMonday = (firstDayOfMonth.getDay() + 6) % 7;
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(1 - setMonday); //startDay 변경
  const endDay = new Date(lastDayOfMonth);
  const remaining = 6 - ((lastDayOfMonth.getDay() + 6) % 7);
  endDay.setDate(endDay.getDate() + remaining);

  {
    /* 일요일기준 -> 혹시 몰라서 백업해둔 것
  const startDaySun = new Date(firstDayOfMonth);
  startDaySun.setDate(1 - firstDayOfMonth.getDay());
  const endDaySun = new Date(lastDayOfMonth);
  endDaySun.setDate(lastDayOfMonth.getDate() + (6 - endDaySun.getDay()));*/
  }

  {
    /* ex)[ [9/29, 9/30, 10/1, 10/2, 10/3, 10/4,10/5] ,
        [10/6,10/7...],
      .
      .
      ,[10/27, 10/28, 10/29, 10/30, 10/31, 11/1, 11/2]]

      ⬆️이런 형태의 2중배열을 만들어주는 함수
   */
  }
  const groupDatesByWeek = (startDay, endDay) => {
    const weeks = [];
    let currentWeek = [];
    let currentDateofWeek = new Date(startDay); //달력 시작일로 초기화
    //console.log("확인용", endDay);

    while (currentDateofWeek <= endDay) {
      currentWeek.push(new Date(currentDateofWeek)); //currentWeek에 넣는
      if (currentWeek.length === 7 || currentDateofWeek === 0) {
        weeks.push(currentWeek);
        currentWeek = []; //새 배열을 위해 비워주기
      }
      currentDateofWeek.setDate(currentDateofWeek.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      //배열에 남아있는 거 털어내기
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = groupDatesByWeek(startDay, endDay);

  {
    /* 앞선 2중 배열에서 선택된 날짜에 해당하는 주를 빼내는 함수
    
    ex) currentDate - 10/8일
    => 반환되는 weekFound⬇️
        [10/6,10/7,10/8,...]

    저는 이걸 weekly에서 주간별로 날짜표?보여줄 때 썼습니다
    */
  }
  const findWeek = (weeks, currentDate) => {
    for (let weekFound = 0; weekFound < weeks.length; weekFound++) {
      for (let j = 0; j < 7; j++) {
        if (
          weeks[weekFound][j].getMonth() === currentDate.getMonth() &&
          weeks[weekFound][j].getDate() === currentDate.getDate()
        )
          return weekFound;
      }
    }
    return -1;
  };
  const weekFound = findWeek(weeks, currentDate);

  //⚠️이 아이는 일간에서 사용하려고 만들었었는데 무시하셔도 될 것 같습니다
  const getTimeTable = () => {
    const timeTb = [];
    for (let t = 0; t < 24; t++) {
      timeTb.push(t);
    }
    return timeTb;
  };
  const timeTable = getTimeTable(currentDate);

  //각각 월간, 주간, 일간모드에서 ⬅️➡️ 버튼 누를 때 보여주는 날짜 바꾸미
  const STEP = {
    monthly: {
      prev: (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1),
      next: (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1),
    },
    weekly: {
      prev: (date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7),
      next: (date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7),
    },

    daily: {
      prev: (date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1),
      next: (date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    },
  };
  return {
    currentDate,
    setCurrentDate,
    year,
    month,
    day,
    currentMonthName,
    currentWeekNum,
    weeks,
    STEP,
    weekFound,
    weekNames,
    timeTable,
    groupDatesByWeek,
  };
}
