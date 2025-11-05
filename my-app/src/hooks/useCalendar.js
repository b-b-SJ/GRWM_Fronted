import { useState } from "react";

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  const [sortMon, setSortMon] = useState(true);
  //월
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
  const timeNameEn = [
    "12am",
    "1am",
    "2am",
    "3am",
    "4am",
    "5am",
    "6am",
    "7am",
    "8am",
    "9am",
    "10am",
    "11am",
    "12pm",
    "1pm",
    "2pm",
    "3pm",
    "4pm",
    "5pm",
    "6pm",
    "7pm",
    "8pm",
    "9pm",
    "10pm",
    "11pm",
  ];
  //console.log(currentMonthName);
  //주차
  const weekNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekNums = ["week 1", "week 2", "week 3", "week 4", "week 5"];
  const currentWeekNum = weekNums[Math.floor(day / 7)]; //!!!!!!!!!!!고쳐야더ㅚ나?

  //달력 시작, 끝
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  //월요일기준
  const setMonday = (firstDayOfMonth.getDay() + 6) % 7;
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(1 - setMonday); //startDay 변경

  const endDay = new Date(lastDayOfMonth);
  const remaining = 6 - ((lastDayOfMonth.getDay() + 6) % 7);
  endDay.setDate(endDay.getDate() + remaining);

  {
    /**   //일요일기준
  const startDaySun = new Date(firstDayOfMonth);
  startDaySun.setDate(1 - firstDayOfMonth.getDay());
  const endDaySun = new Date(lastDayOfMonth);
  endDaySun.setDate(lastDayOfMonth.getDate() + (6 - endDaySun.getDay()));*/
  }

  const groupDatesByWeek = (startDay, endDay) => {
    const weeks = [];
    let currentWeek = [];
    let currentDateofWeek = new Date(startDay); //달력 시작일로 초기화
    //console.log("확인용", endDay);

    while (currentDateofWeek <= endDay) {
      currentWeek.push(new Date(currentDateofWeek)); //currentWeek에 넣는
      if (currentWeek.length === 7 || currentDateofWeek === 0) {
        weeks.push(currentWeek); //들어오는 순서대로 차곡차곡 쌓임
        currentWeek = []; //비워주기
      }
      currentDateofWeek.setDate(currentDateofWeek.getDate() + 1); //
    }

    if (currentWeek.length > 0) {
      //배열에 남아있는 거 털어내기
      weeks.push(currentWeek);
    }

    //지금 현재 날짜 기준으로 몇주인지

    return weeks; //결과적으로 이중배열 구조가 됨
  };

  const weeks = groupDatesByWeek(startDay, endDay);
  // weeks is an array of arrays, each with 7 Date objects

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

  const getTimeTable = () => {
    const timeTb = [];
    for (let t = 0; t < 24; t++) {
      timeTb.push(t);
    }
    return timeTb;
  };
  const timeTable = getTimeTable(currentDate);

  //플래너 날짜?달?을 왔다갔다
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
    findWeek,
    weekFound,
    weekNames,
    timeTable,
  };
}
