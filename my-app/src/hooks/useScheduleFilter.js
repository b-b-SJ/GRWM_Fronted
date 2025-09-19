import { useState } from "react";
import ScheduleListSidebar from "../components/planner/ScheduleListSidebar";

export function useScheduleFilter({ nowPlanner, currentDate }) {
  const [schedules, setSchedules] = useState([
    //확인용 데이터 하드코딩
    {
      id: 1,
      title: "회의",
      startDateTime: "2025-07-21T10:00:00",
      finishDateTime: "2025-07-21T11:00:00",
      location: "집",
      memo: "늦지 말기!",
      plannerId: 1001,
      categoryId: 101,
    },
    {
      id: 2,
      title: "점심 약속",
      startDateTime: "2025-08-31T12:00:00",
      finishDateTime: "2025-08-31T13:00:00",
      location: "블루샹하이",
      memo: "늦지 말기!",
      plannerId: 1001,
      categoryId: 102,
    },
    {
      id: 3,
      title: "노트북 수리",
      startDateTime: "2025-07-21T15:00:00",
      finishDateTime: "2025-07-21T16:00:00",
      location: "LG BEST care 서비스센터",
      memo: "카드 챙겨!!",
      plannerId: 1001,
      categoryId: null,
    },
    {
      id: 4,
      title: "도서관뺑이즈",
      startDateTime: "2025-08-04T21:00:00",
      finishDateTime: "2025-08-05T18:00:00",
      location: "수내도서관",
      memo: "뺑이온앤온",
      plannerId: 1001,
      categoryId: 101,
    },
    {
      id: 5,
      title: "SRT타러..",
      startDateTime: "2025-08-04T09:00:00",
      finishDateTime: "2025-08-04T10:00:00",
      location: "수서역",
      memo: "늦지 말기!",
      plannerId: 1002,
      categoryId: null,
    },
    {
      id: 6,
      title: "병원진료",
      startDateTime: "2025-07-22T15:00:00",
      finishDateTime: "2025-07-22T16:00:00",
      location: "수내역",
      memo: "",
      plannerId: 1001,
      categoryId: 103,
    },
    {
      id: 7,
      title: "스터디 모임",
      startDateTime: "2025-08-04T07:00:00",
      finishDateTime: "2025-08-04T16:00:00",
      location: "카페베네 홍대점",
      memo: "발표 준비해가기!",
      plannerId: 1001,
      categoryId: 101,
    },
    {
      id: 8,
      title: "운동하기",
      startDateTime: "2025-08-06T08:00:00",
      finishDateTime: "2025-08-06T09:00:00",
      location: "헬스장",
      memo: "하체 루틴",
      plannerId: 1002,
      categoryId: null,
    },
    {
      id: 9,
      title: "구름 관찰회",
      startDateTime: "2025-08-07T14:44:00",
      finishDateTime: "2025-08-07T15:07:00",
      location: "옥상 또는 환상",
      memo: "맑으면 간다",
      plannerId: 1003,
      categoryId: null,
    },
    {
      id: 10,
      title: "개발 회의",
      startDateTime: "2025-08-04T13:40:00",
      finishDateTime: "2025-08-07T19:00:00",
      location: "줌(Zoom)",
      memo: "링크 미리 접속해보기",
      plannerId: 1001,
      categoryId: 101,
    },
    {
      id: 11,
      title: "마감일",
      startDateTime: "2025-08-14T23:00:00",
      finishDateTime: "2025-08-16T01:00:00",
      location: "집",
      memo: "프로젝트 제출!",
      plannerId: 1001,
      categoryId: null,
    },
    {
      id: 12,
      title: "디자인 작업",
      startDateTime: "2025-08-07T17:00:00",
      finishDateTime: "2025-08-07T17:05:00",
      location: "아마스빈",
      memo: "피그마 정리하기",
      plannerId: 1001,
      categoryId: 105,
    },
    {
      id: 13,
      title: "가족 외식",
      startDateTime: "2025-08-09T18:00:00",
      finishDateTime: "2025-08-09T20:00:00",
      location: "능이백숙",
      memo: "몸보신하는 날",
      plannerId: 1001,
      categoryId: 102,
    },
    {
      id: 14,
      title: "시험공부",
      startDateTime: "2025-08-12T10:00:00",
      finishDateTime: "2025-08-12T16:00:00",
      location: "도서관",
      memo: "딴짓 금지!!",
      plannerId: 1003,
      categoryId: 103,
    },
    {
      id: 15,
      title: "병원예약 확인",
      startDateTime: "2025-08-08T11:00:00",
      finishDateTime: "2025-08-08T11:30:00",
      location: "집",
      memo: "문자 확인",
      plannerId: 1002,
      categoryId: null,
    },
    {
      id: 16,
      title: "빈둥거리는 시간",
      startDateTime: "2025-08-12T10:30:00",
      finishDateTime: "2025-08-13T12:00:00",
      location: "내 침대",
      memo: "편한 옷을 입어야만",
      plannerId: 1001,
      categoryId: 102,
    },
    {
      id: 17,
      title: "도서관가는 날..",
      startDateTime: "2025-08-09T13:30:00",
      finishDateTime: "2025-08-09T16:00:00",
      location: "분당 수내도서관",
      memo: "울고 싶지 않아..에에",
      plannerId: 1001,
      categoryId: 102,
    },
    {
      id: 18,
      title: "추가 수강신청",
      startDateTime: "2025-08-26T09:00:00",
      finishDateTime: "2025-08-27T17:00:00",
      location: "집앞 pc방",
      memo: "잡아보자",
      plannerId: 1001,
      categoryId: 104,
    },
  ]);
  // console.log("넘겨주는 nowPlanner 타입:", nowPlanner, typeof nowPlanner);
  //  const [nowPlanner, setNowPlanner] = useState(1001); //하드코딩 -> 수정 예정

  const scPlannerFilter = (schedules, fPlannerId) => {
    return schedules.filter((sc) => sc.plannerId === fPlannerId);
    //위에 코드는 배열 검색에 해당됨
    //filter는 얕은 복사본 배열을 생성?함
  };
  const scPlannerFiltered = scPlannerFilter(schedules, nowPlanner);
  console.log("ㅇ", currentDate); //아직 currentDate를 어디다가 써야될지 모르겟음

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

  const groupedDate = groupbyDate(scPlannerFiltered);
  //console.log("그루핑 확인슨요", groupedDate);

  const scMonthFilter = (schedules, targetDate) => {
    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, "0");
    const monthStr = `${year}-${month}`; // ex) "2025-08"
    const scMonthFiltered = [];
    for (let i = 0; i < schedules.length; i++) {
      if (schedules[i].date.slice(0, 7) === monthStr) {
        scMonthFiltered.push(schedules[i]);
      }
    }
    return scMonthFiltered;
  };

  //new Date() 말고 다른 걸 넣어야되는데 아직 모르겟떠염
  const scMonthFiltered = scMonthFilter(groupedDate, new Date()); //아직 다른 날짜들은 어케 해야할지 모루겟긔
  console.log("ㄷㄷㄷㄷ", scMonthFiltered);

  const scDateFilter = (schedules, targetDate) => {
    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, "0");
    const date = targetDate.getDate().toString().padStart(2, "0");
    const monthStr = `${year}-${month}-${date}`; // ex) "2025-08-27"

    for (let i = 0; i < schedules.length; i++) {
      if (schedules[i].date === monthStr) {
        return schedules[i];
      }
    }
    return null;
  };
  const scTodayFiltered = scDateFilter(groupedDate, new Date());
  //console.log("ㄷ듀듀듀", scTodayFiltered);

  const getselectedSchedule = (id, sc) => {
    //이 아이를 결코 지워선 안돼.......얘는 모달을 위해 필요해요

    for (let i = 0; i < sc.length; i++) {
      if (sc[i].id === id) {
        console.log("이걸 돌려줄게여", sc[i]);
        return sc[i];
      }
    }
  };

  const getAllDaySc = () => {};

  return {
    schedules,
    // scPlannerFilter,
    scPlannerFiltered,
    scTodayFiltered,
    scDateFilter,
    //mSchedulePreview,
    scMonthFiltered,
    // mPreviewMap,
    groupedDate,
    getselectedSchedule,
  };
}
{
  /**
      const MSchedulePreview = (schedules) => {
    const schedPreview = [];

    //앞에 있는 두 개의 스케쥴만 리턴 -> 근데 지금 그냥 다 반환해주는 일이 발생하고 있음
    for (let i = 0; i < schedules.length; i++) {
      const daySchedules = schedules[i].schedules;
      const preview = {
        date: schedules[i].date,
        previewScheduled: daySchedules, //스케쥴 2개까지만 전달 시 .slice(0,2)-> 혹시 몰라서 걍 이케 둠 일단
        moreCount: daySchedules.length > 2 ? daySchedules.length - 2 : 0,
      };

      schedPreview.push(preview);
    }
    return schedPreview;
  };
  const mSchedulePreview = MSchedulePreview(scMonthFiltered);
  console.log("응애", mSchedulePreview);

  const mPreviewMap = new Map(mSchedulePreview.map((sc) => [sc.date, sc]));
   console.log("깁미깁비모어", mPreviewMap); 
  */
}
