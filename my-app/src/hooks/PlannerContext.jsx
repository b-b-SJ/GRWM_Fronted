// localStorage 관련은 아직 도입X
import { createContext, useContext, useState, useEffect } from "react";
import { useCalendar } from "./useCalendar";

const PlannerContext = createContext(null);

export const PlannerProvider = ({ children, plannerType = "personal" }) => {
  const calendar = useCalendar();
  const [viewMode, setViewMode] = useState("monthly");
  const [openScModal, setOpenScModal] = useState(false);
  const [selectedSc, setSelectedSc] = useState(null);

  // localStorage 키 생성
  const STORAGE_KEY = `lastPlanner_${plannerType}`;
  // 초기값 설정
  const [nowPlanner, setNowPlanner] = useState(() => {
    // localStorage에서 가져오기
    const lastPlanner = localStorage.getItem(STORAGE_KEY);

    if (lastPlanner) {
      return Number(lastPlanner);
    }

    // localStorage에 없으면 기본값
    // shared는 null (아직 선택 안 함), personal은 1 (기본 개인 플래너)
    return plannerType === "shared" ? null : 1;
  });

  // nowPlanner가 바뀔 때마다 localStorage 저장

  useEffect(() => {
    if (nowPlanner !== null) {
      localStorage.setItem(STORAGE_KEY, nowPlanner);
      console.log(`${plannerType} 플래너 저장:`, nowPlanner);
    }
  }, [nowPlanner, STORAGE_KEY, plannerType]);

  // 플래너 변경 함수
  const handleSetNowPlanner = (plannerId) => {
    setNowPlanner(plannerId);
    // useEffect에서 자동 저장되니까 여기선 안 해도 됨
  };

  return (
    <PlannerContext.Provider
      value={{
        // 캘린더 (useCalendar에서 온 모든 것)
        currentDate: calendar.currentDate,
        setCurrentDate: calendar.setCurrentDate,
        year: calendar.year,
        month: calendar.month,
        day: calendar.day,
        currentMonthName: calendar.currentMonthName,
        currentWeekNum: calendar.currentWeekNum,
        weeks: calendar.weeks,
        weekFound: calendar.weekFound,
        weekNames: calendar.weekNames,
        STEP: calendar.STEP,
        timeTable: calendar.timeTable,
        findWeek: calendar.findWeek, //혹시 몰라서 일단 살려둠
        //groupDatesByWeek는 사이드바에서만 직접 호출할 예정이라 따로 context화X

        // 플래너 타입
        plannerType,
        isShared: plannerType === "shared",
        isPersonal: plannerType === "personal",

        // 뷰 모드
        viewMode,
        setViewMode,

        // 현재 플래너
        nowPlanner,
        setNowPlanner: handleSetNowPlanner,

        // 모달
        openScModal,
        setOpenScModal,
        selectedSc,
        setSelectedSc,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlannerContext = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error(
      "usePlannerContext는 PlannerProvider 내부에서 사용해야 합니다"
    );
  }
  return context;
};
