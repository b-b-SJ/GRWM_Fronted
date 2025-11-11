// src/hooks/PlannerContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useCalendar } from "./useCalendar";

const PlannerContext = createContext(null);

export const PlannerProvider = ({ children, plannerType = "personal" }) => {
  const calendar = useCalendar();
  const [viewMode, setViewMode] = useState("monthly");
  const [openScModal, setOpenScModal] = useState(false);
  const [selectedSc, setSelectedSc] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const STORAGE_KEY = `planner_last_${plannerType}_id`;

  const [nowPlanner, setNowPlanner] = useState(() => {
    console.log("플래너 저장가야지");
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  // 🔥 nowPlanner 변경 시 localStorage 저장
  useEffect(() => {
    if (nowPlanner !== null) {
      localStorage.setItem(STORAGE_KEY, String(nowPlanner));

      // 🔥 plannerType도 함께 저장!
      localStorage.setItem("lastPlannerType", plannerType);

      console.log(`💾 [${plannerType}] localStorage 저장:`, {
        plannerId: nowPlanner,
        plannerType: plannerType,
      });
    }
  }, [nowPlanner, STORAGE_KEY, plannerType]);

  return (
    <PlannerContext.Provider
      value={{
        // 캘린더
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
        findWeek: calendar.findWeek,

        // 플래너 타입
        plannerType,
        isShared: plannerType === "shared",
        isPersonal: plannerType === "personal",

        // 뷰 모드
        viewMode,
        setViewMode,

        //카테고리
        selectedCategory,
        setSelectedCategory,
        // 현재 플래너
        nowPlanner,
        setNowPlanner,

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
