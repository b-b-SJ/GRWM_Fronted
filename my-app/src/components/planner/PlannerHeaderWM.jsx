import React, { useState, useEffect } from "react";
import WeeklyPlanner from "./WeeklyPlanner";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import DailyPlanner from "./DailyPlanner";
import { useNavigate } from "react-router-dom";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import { usePlannerContext } from "../../hooks/PlannerContext";
import { useTeamPlanner } from "../../hooks/TeamPlannerProvider";
import MonthlyGrid from "./MonthlyGrid";
import CategoryManager from "./CategoryManager";

const PlannerHeaderWM = () => {
  const {
    viewMode,
    setViewMode,
    STEP,
    currentDate,
    setCurrentDate,
    currentMonthName,
    currentWeekNum,
    year,
    month,
    nowPlanner,
    plannerType,
    selectedCategory,
    setSelectedCategory,
  } = usePlannerContext();

  const {
    planners,
    categories,
    fetchCategories,
    fetchSchedulesByCategory,
    fetchMonthlySchedules,
  } = useCurrentPlanner(plannerType);

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const navigate = useNavigate();

  // 카테고리 목록 불러오기
  useEffect(() => {
    if (nowPlanner && plannerType === "shared") {
      fetchCategories(nowPlanner);
    }
  }, [nowPlanner, plannerType]);

  const findNowPlannerInfo = () => {
    return planners.find((planner) => planner.plannerId === nowPlanner);
  };

  const nowPlannerInfo = findNowPlannerInfo();

  const handleGoToList = () => {
    navigate(`/planner/list/${plannerType}`);
  };

  const goPrev = () => setCurrentDate((prev) => STEP[viewMode].prev(prev));
  const goNext = () => setCurrentDate((prev) => STEP[viewMode].next(prev));

  // 카테고리 필터 적용
  const handleApplyFilter = async () => {
    if (selectedCategory) {
      // 선택된 카테고리로 필터링
      await fetchSchedulesByCategory(nowPlanner, selectedCategory);
    } else {
      // 전체 일정 다시 불러오기
      await fetchMonthlySchedules(nowPlanner, year, month);
    }
    setShowCategoryDropdown(false);
  };

  // 선택된 카테고리 정보 가져오기
  const getSelectedCategoryInfo = () => {
    if (!selectedCategory) return null;
    return categories.find((cat) => cat.categoryId === selectedCategory);
  };

  const selectedCategoryInfo = getSelectedCategoryInfo();

  return (
    <div className="pt-4">
      <div className="mt-2 ml-24 flex items-start p-3 outline outline-gray-800 font-bold rounded-r-3xl rounded-tl-3xl w-fit pl-5 pr-5">
        {nowPlannerInfo?.title}
      </div>

      <div className="flex items-center relative">
        <div className="flex items-center gap-7 px-4 outline-gray-700">
          {/* 플래너 전환 */}
          <div className="relative group inline-block">
            <button
              onClick={handleGoToList}
              className={`w-20 h-20 rounded-full flex items-center justify-center bg-cover bg-center
                ${
                  !nowPlannerInfo?.profileImage &&
                  (plannerType === "shared" ? "bg-blue-100" : "bg-gray-100")
                }`}
              style={
                nowPlannerInfo?.profileImage
                  ? { backgroundImage: `url(${nowPlannerInfo.profileImage})` }
                  : {}
              }
            >
              {!nowPlannerInfo?.profileImage && (
                <Users
                  className={`w-10 h-10 ${
                    plannerType === "shared" ? "text-blue-500" : "text-gray-500"
                  }`}
                />
              )}
            </button>
            <div className="absolute left-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg hidden group-hover:block">
              달력 바꾸미
            </div>
          </div>

          {/* Monthly/Weekly 토글 */}
          <div className="flex p-1.5 w-fit rounded-2xl text-sm font-bold text-gray-500 outline outline-2 mt-6">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-xl ${
                viewMode === "monthly" ? "bg-blue-400 text-white" : "bg-white"
              }`}
            >
              monthly
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 rounded-xl ${
                viewMode === "weekly" ? "bg-blue-400 text-white" : "bg-white"
              }`}
            >
              weekly
            </button>
          </div>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-md font-bold text-gray-500">
            {viewMode === "weekly" ? currentMonthName : year}
          </span>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => goPrev()} className="px-3 py-1">
              <ChevronLeft className="hover:bg-gray-100 rounded-md" />
            </button>

            <span className="text-5xl font-bold min-w-100">
              {viewMode === "weekly" ? (
                currentWeekNum
              ) : (
                <div>
                  {viewMode === "daily"
                    ? currentMonthName + " " + currentDate.getDate()
                    : currentMonthName}
                </div>
              )}
            </span>

            <button onClick={() => goNext()} className="px-3 py-1">
              <ChevronRight className="hover:bg-gray-100 rounded-md" />
            </button>
          </div>
        </div>

        {/* 오른쪽: 카테고리 필터 + 검색 */}

        <div className="ml-auto flex items-center gap-2">
          {/* 카테고리 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Filter size={18} />
              {selectedCategoryInfo ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedCategoryInfo.color }}
                  />
                  <span>{selectedCategoryInfo.categoryName}</span>
                </>
              ) : (
                <span>전체</span>
              )}
            </button>

            {/* 드롭다운 메뉴 */}
            {showCategoryDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-2 max-h-80 overflow-y-auto">
                  {/* 전체 옵션 */}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 ${
                      !selectedCategory ? "bg-blue-50" : ""
                    }`}
                  >
                    전체
                  </button>

                  {/* 카테고리 목록 */}
                  {categories.map((category) => (
                    <button
                      key={category.categoryId}
                      onClick={() => setSelectedCategory(category.categoryId)}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 ${
                        selectedCategory === category.categoryId
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.categoryName}
                    </button>
                  ))}
                </div>

                {/* 적용 버튼 */}
                <div className="border-t p-2">
                  <button
                    onClick={handleApplyFilter}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    적용
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 카테고리 관리 버튼 */}
          <button
            onClick={() => setShowCategoryManager(true)}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="카테고리 관리"
          >
            <Plus size={20} />
          </button>

          {/* 검색 버튼 (나중에 구현) */}
          <button
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="일정 검색"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* 뷰 모드별 플래너 표시 */}
      <div>
        {viewMode === "monthly" && (
          <div className="mt-4 mx-8">
            <MonthlyGrid
              totalDateStyle={`
                relative p-4 border border-gray-100 min-h-[120px] 
                hover:bg-gray-100 bg-white shadow-sm
              `}
              onDateClick={(day) => {
                setViewMode("daily");
                setCurrentDate(day);
              }}
              currentMonthStyle={`text-gray-900 bg-white`}
              ncMonthStyle={`
                text-gray-400 bg-gray-50 
                hover:bg-gray-100 opacity-70
              `}
            />
          </div>
        )}

        {viewMode === "weekly" && (
          <WeeklyPlanner
            onDateClick={(day) => {
              setViewMode("daily");
              setCurrentDate(day);
            }}
          />
        )}

        {viewMode === "daily" && <DailyPlanner />}
      </div>

      {/* 카테고리 관리 모달 */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        plannerId={nowPlanner}
      />
    </div>
  );
};

export default PlannerHeaderWM;
