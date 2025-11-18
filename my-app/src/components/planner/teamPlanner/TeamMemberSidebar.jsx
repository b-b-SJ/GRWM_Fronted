import { useState } from "react";
import { Users, Clock } from "lucide-react";
import TeamManagementTab from "./TeamManagementTab";
import TimeVoteTab from "./timeVote/TimeVoteTab";

/**
 * 팀플래너 사이드바 메인 컴포넌트
 * - 팀원 관리/필터링 탭
 * - 시간 투표 탭
 */
const TeamPlannerSidebar = ({ plannerId }) => {
  // 현재 활성화된 탭: 'management' | 'timeVote'
  const [activeTab, setActiveTab] = useState("management");

  const tabs = [
    {
      id: "management",
      label: "관리·필터링",
      icon: Users,
    },
    {
      id: "timeVote",
      label: "시간 투표",
      icon: Clock,
    },
  ];

  return (
    <div className="w-80 border-l bg-blue h-full flex flex-col ">
      {/* 탭 헤더 */}
      <div className="border-b bg-gray-50">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "management" && (
          <TeamManagementTab plannerId={plannerId} />
        )}
        {activeTab === "timeVote" && <TimeVoteTab plannerId={plannerId} />}
      </div>
    </div>
  );
};

export default TeamPlannerSidebar;
