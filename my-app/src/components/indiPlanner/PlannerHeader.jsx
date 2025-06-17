import React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Plus,
} from "lucide-react";

{
  /*
   * 플래너 부분 상단에 해당- 제목, 뷰 토글, 검색, 카테고리 필터, 월 이동 네비게이션, 일정 추가 버튼
   */
}
const PlannerHeader = ({
  currentDate,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  onPrevMonth,
  onNextMonth,
  onAddEvent, //, onToday
}) => {
  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">개인 플래너</h1>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button //토글 버튼
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "monthly"
                  ? "bg-white text-blue-600 shadow-sm" //선택시 색상
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "weekly"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..." //검색창
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)} //카테고리 필터
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 bg-white"
            >
              <option value="all">전체</option>
              <option value="work">업무</option>
              <option value="personal">개인</option>
              <option value="social">사교</option>
            </select>
          </div>
        </div>
      </div>

      {/*날짜 표시 -> 추후 표기 방법 변경 예정*/}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </h2>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
          {/* //오늘 날짜로 돌아오는 버튼 
          <button onClick={onToday} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Today
          </button> 
          */}
        </div>
        <button
          onClick={onAddEvent}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus size={18} /> <span>Add Event</span>
        </button>
      </div>
    </div>
  );
};

export default PlannerHeader;
