import React, { useState, navigate } from "react";
import { ChevronRight, MessageSquare, Users } from "lucide-react";
import { Routes, Route } from "react-router-dom";
import CommunityProfile from "../../community/CommunityProfile";
//import MainTimeLine from "../../community/MainTimeLine";
import TimeLinePage from "./TimeLinePage";
import CommunitySidebar from "../../layout/CommunitySidebar";
import SearchPage from "../../community/SearchPage";
/**
 * 임시 CommunityPage UI
 *
 * endpoint 완성해놓기 - 백이랑 연결하게
 *
 */
const CommunityPage = () => {
  const [comSidebarOpen, setComSidebarOpen] = useState(true);
  return (
    <div className="flex-col flex flex-1 ">
      <div className="flex flex-1  overflow-y-auto">
        <button
          onClick={() => setComSidebarOpen(!comSidebarOpen)}
          className="bg-rose-200"
        >
          <ChevronRight
            size={16}
            className={`transform transition-transform ${
              comSidebarOpen === true ? "scale-x-[-1]" : ""
            }`}
          />
        </button>

        {comSidebarOpen === true && <CommunitySidebar />}
        <div className="flex flex-col col-span-1">
          <Routes>
            <Route path="/" element={<TimeLinePage />} />
            <Route path="profile" element={<CommunityProfile />} />{" "}
            {/**userId 받는 시그로 처리해야됨 */}
            <Route path="search" element={<SearchPage />} />
            <Route path="*" element={<TimeLinePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
{
  /*
      //임시 준비 화면
      <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <MessageSquare className="mr-3" size={32} />
            커뮤니티
          </h1>
          <p className="text-gray-600">다른 사용자와 소통하세요</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-pink-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              커뮤니티 기능 준비 중
            </h2>
          </div>
        </div>
      </div>
    </div>
      
      */
}
export default CommunityPage;
