// src/hooks/PlannerContext.jsx
import { createContext, useContext, useState } from "react";
import { useCalendar } from "./useCalendar";

const PlannerContext = createContext(null);

export const PlannerProvider = ({ children }) => {
  const calendar = useCalendar();
  //플래너 상태 관리
  const [viewMode, setViewMode] = useState("monthly");
  const [nowPlanner, setNowPlanner] = useState(null);

  // 모달 상태 관리
  const [openScModal, setOpenScModal] = useState(false);
  const [selectedSc, setSelectedSc] = useState(null);

  return (
    <PlannerContext.Provider
      value={{
        // 캘린더 관련
        ...calendar,

        // 뷰 모드 관련
        viewMode,
        setViewMode,

        // 플래너 선택
        nowPlanner,
        setNowPlanner,

        // 모달 관련
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
      "usePlannerContext는 PlannerProvider 내에서 사용해야 합니다"
    );
  }
  return context;
};
