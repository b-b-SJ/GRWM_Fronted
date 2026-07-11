import React, { useState, useEffect } from "react";
import WeeklyPlanner from "./WeeklyPlanner";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Plus,
  Search,
  Filter,
  X,
} from "lucide-react";
import DailyPlanner from "./DailyPlanner";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import { usePlannerContext } from "../../hooks/PlannerContext";
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
    plannerType,
    selectedCategory,
    setSelectedCategory,
    memberFilteredSchedules,
    searchedSchedules,
    setSearchedSchedules,
    searchKeyword,
    setSearchKeyword,
  } = usePlannerContext();

  const {
    planners,
    categories,
    schedules,
    fetchCategories,
    fetchSchedulesByCategory,
    fetchMonthlySchedules,
    fetchWeeklySchedules,
    searchSchedulesByKeyword,
  } = useCurrentPlanner(plannerType);

  const { plannerId } = useParams();
  const nowPlanner = Number(plannerId);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  // 주 번호 계산 함수
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // 카테고리 목록 불러오기
  useEffect(() => {
    const loadData = async () => {
      if (!nowPlanner) return;

      try {
        if (viewMode === "monthly") {
          await fetchMonthlySchedules(nowPlanner, year, month + 1);
        } else {
          await fetchWeeklySchedules(
            nowPlanner,
            year,
            getWeekNumber(currentDate)
          );
        }

        if (plannerType === "shared") {
          await fetchCategories(nowPlanner);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };

    loadData();
  }, [nowPlanner, plannerType, viewMode, year, month, currentDate]);

  const findNowPlannerInfo = () => {
    return planners.find((planner) => planner.plannerId === nowPlanner);
  };

  //  검색 → 멤버 필터 → 카테고리 필터 순차 적용
  const getFilteredSchedules = () => {
    let baseSchedules =
      searchedSchedules || memberFilteredSchedules || schedules;

    if (selectedCategory) {
      return baseSchedules?.filter(
        (schedule) => schedule.category?.categoryId === selectedCategory
      );
    }

    return baseSchedules;
  };

  const filteredSchedules = getFilteredSchedules();

  const nowPlannerInfo = findNowPlannerInfo();

  const handleGoToList = () => {
    navigate(`/planner/list/${plannerType}`);
  };

  const goPrev = () => setCurrentDate((prev) => STEP[viewMode].prev(prev));
  const goNext = () => setCurrentDate((prev) => STEP[viewMode].next(prev));

  // 카테고리 필터 적용
  const handleApplyFilter = async () => {
    if (selectedCategory) {
      await fetchSchedulesByCategory(nowPlanner, selectedCategory);
    } else {
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

  //  검색 기능 구현
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert("검색어를 입력하세요");
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchSchedulesByKeyword(nowPlanner, searchKeyword);

      setSearchedSchedules(results);
    } catch (error) {
      console.error("❌ 검색 실패:", error);
      alert("검색에 실패했습니다: " + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="pt-4">
      <div className="mt-2 ml-24 flex items-start p-3 outline outline-gray-800 font-bold rounded-r-3xl rounded-tl-3xl w-fit pl-5 pr-5 bg-white">
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
                  (plannerType === "shared" ? "bg-blue-100" : "bg-gray-200")
                }`}
              style={
                nowPlannerInfo?.profileImage
                  ? { backgroundImage: `url(${nowPlannerInfo.profileImage})` }
                  : {}
              }
            >
              {!nowPlannerInfo?.profileImage &&
                (plannerType === "shared" ? (
                  <Users
                    className="w-10 h-10 
                   text-blue-500"
                  />
                ) : (
                  <User
                    className="w-10 h-10 
                    text-gray-600"
                  />
                ))}
            </button>
            <div className="absolute left-5 top-full mt-2 w-32 text-sm  bg-white border hidden group-hover:block">
              클릭하여 달력 바꾸기
            </div>
          </div>

          {/* Monthly/Weekly 토글 */}
          <div className="flex p-1.5 w-fit rounded-2xl text-sm font-bold text-gray-500 outline outline-2 mt-6 bg-white">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-6 py-2 rounded-xl ${
                viewMode === "monthly" ? "bg-blue-400 text-white" : "bg-white"
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-6 py-2 rounded-xl ${
                viewMode === "weekly" ? "bg-blue-400 text-white" : "bg-white"
              }`}
            >
              주간
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
                    ? currentMonthName + " " + currentDate.getDate() + "일"
                    : currentMonthName}
                </div>
              )}
            </span>

            <button onClick={() => goNext()} className="px-3 py-1">
              <ChevronRight className="hover:bg-gray-100 rounded-md" />
            </button>
          </div>
        </div>

        {/* 오른쪽: 카테고리 필터 */}
        <div className="flex items-center gap-2 ml-auto mr-3">
          {/* 카테고리 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="bg-white flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
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
              </div>
            )}
          </div>

          {/* 카테고리 추가 및 관리 버튼 */}
          <button
            onClick={() => setShowCategoryManager(true)}
            className="p-2 border rounded-lg bg-white hover:bg-gray-50"
            title="카테고리 관리"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* 검색창 */}
      <div className="mt-1 px-4 flex justify-end">
        <div className="flex items-center gap-2 w-80">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="일정 검색"
            className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 flex items-center gap-1 disabled:opacity-50"
          >
            <Search size={16} />
            {isSearching ? "검색 중..." : "검색"}
          </button>
        </div>
      </div>

      {/* 뷰 모드별 플래너 표시 */}
      <div>
        {viewMode === "monthly" && (
          <div className="mt-4 mx-8">
            <MonthlyGrid
              schedules={filteredSchedules}
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
            schedules={filteredSchedules}
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
