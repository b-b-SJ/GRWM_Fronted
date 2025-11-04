import { useState } from "react";

export function useScheduleGrouping() {
  //1. 일단 시간 슬라이스-> 따로 보관해두기
  //2. ([전체덩어리]+시간 초) 이런 게 여러개로 이루어져 있는 구조? - 3중 배열이 되는 건가?
  //3. 날짜별로 묶어? 정리?해

  const groupbyDate = (schedules) => {
    const grouped = {}; //객체로 선언
    for (let i = 0; i < schedules.length; i++) {
      const date = schedules[i].startDateTime.slice(0, 10);
      const endDate = schedules[i].finishDateTime.slice(0, 10);
      for (
        //스케쥴이 하루 이상에 걸쳐서 있을 경우에 스케쥴 시작일~마지막일까지 저장해줌
        let j = new Date(date);
        j <= new Date(endDate);
        j.setDate(j.getDate() + 1) //날짜 비교를 위해 객체화
      ) {
        const dateStr = j.toISOString().slice(0, 10);

        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(schedules[i]);
      }
    }
    return Object.keys(grouped) //순서대로 저장
      .sort()
      .map((date) => ({
        date,
        schedules: grouped[date].sort((a, b) =>
          a.startDateTime.localeCompare(b.startDateTime)
        ),
      }));
  };

  return {
    groupbyDate,
  };
}
