// TeamManagementTab.jsx
import { useState, useEffect } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { useAuth } from "../../../hooks/AuthContext";
import { usePlannerContext } from "../../../hooks/PlannerContext";
import MemberCard from "./MemberCard";
import AddMemberModal from "./AddMemberModal";
import { Users, UserPlus, Funnel, Check, X } from "lucide-react";

/**
 * 팀원 관리 및 필터링 탭
 * - 팀원 목록 조회/추가/삭제
 * - 팀원별 일정 필터링
 */
const TeamManagementTab = ({ plannerId }) => {
  const { members, fetchMembers, loading, error, searchSchedulesByUser } =
    useTeamPlanner();
  const { user } = useAuth();
  const { selectedMember, setSelectedMember, setMemberFilteredSchedules } =
    usePlannerContext();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberScFilterMode, setMemberScFilterMode] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // 플래너가 선택되면 멤버 목록 불러오기
  useEffect(() => {
    if (plannerId) {
      fetchMembers(plannerId);
    }
  }, [plannerId]);

  // 필터링 모드 꺼질 때 초기화
  useEffect(() => {
    if (!memberScFilterMode) {
      setSelectedMember(null);
      setMemberFilteredSchedules(null);
    }
  }, [memberScFilterMode]);

  // 현재 사용자가 manager인지 확인
  const currentUserMember = members.find((m) => m.userId === user?.userId);
  const isManager = currentUserMember?.role === "manager";

  // 필터 적용 핸들러
  const handleApplyFilter = async () => {
    if (selectedMember === null) {
      // 전체 보기
      setMemberFilteredSchedules(null);
      return;
    }

    setApplyLoading(true);
    try {
      const schedules = await searchSchedulesByUser(plannerId, selectedMember);
      console.log("시도하다", schedules);
      setMemberFilteredSchedules(schedules);
    } catch (err) {
      console.error("멤버별 일정 검색 실패:", err);
      alert("일정 검색에 실패했습니다.");
    } finally {
      setApplyLoading(false);
    }
  };

  // 필터 초기화
  const handleResetFilter = () => {
    setMemberScFilterMode(false);
    setSelectedMember(null);
    setMemberFilteredSchedules(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 헤더 영역 */}
      <div className="p-4 border-b bg-white flex-shrink-0">
        {/* 팀원 관리 섹션 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gray-600" />
              <h3 className="font-semibold text-base">팀원 관리</h3>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {members.length}명
            </span>
          </div>

          {/* 권한 표시 */}
          {currentUserMember && (
            <div className="text-xs text-gray-500 mb-2">
              내 역할:{" "}
              <span className="font-medium">
                {currentUserMember.role === "manager" ? "관리자" : "멤버"}
              </span>
            </div>
          )}

          {/* 멤버 추가 버튼 (관리자만) */}
          {isManager && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <UserPlus size={16} />
              <span>팀원 초대</span>
            </button>
          )}

          {!isManager && (
            <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 rounded">
              팀원 초대는 관리자만 가능합니다
            </div>
          )}
        </div>

        {/* 필터링 섹션 */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Funnel size={18} className="text-gray-600" />
              <h3 className="font-semibold text-base">일정 필터</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-600">활성화</span>
              <input
                type="checkbox"
                checked={memberScFilterMode}
                onChange={(e) => setMemberScFilterMode(e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>

          {/* 필터 활성화 시 전체 보기 옵션 */}
          {memberScFilterMode && (
            <div className="mb-2">
              <label className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="memberFilter"
                  checked={selectedMember === null}
                  onChange={() => setSelectedMember(null)}
                  className="w-4 h-4 flex-shrink-0"
                />
                <div className="font-medium text-sm">전체 일정 보기</div>
              </label>
            </div>
          )}

          {/* 필터 적용 중일 때 상태 표시 */}
          {memberScFilterMode && selectedMember !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-700">
                  필터 적용 중:{" "}
                  {members.find((m) => m.userId === selectedMember)?.nickname ||
                    "멤버"}
                </span>
                <button
                  onClick={handleResetFilter}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 멤버 목록 영역 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 text-sm">멤버 로딩 중...</div>
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">팀원이 없습니다</p>
          </div>
        )}

        {/* 멤버 카드 목록 */}
        <div className="space-y-2">
          {members.map((member) => (
            <MemberCard
              key={member.userId}
              member={member}
              plannerId={plannerId}
              isManager={isManager}
              user={user}
              showRadio={memberScFilterMode}
              isSelected={selectedMember === member.userId}
              onSelect={() => setSelectedMember(member.userId)}
            />
          ))}
        </div>
      </div>

      {/* 필터 적용 버튼 (하단 고정) */}
      {memberScFilterMode && (
        <div className="p-4 border-t bg-white flex-shrink-0">
          <button
            onClick={handleApplyFilter}
            disabled={applyLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Check size={16} />
            <span>{applyLoading ? "검색 중..." : "필터 적용"}</span>
          </button>
        </div>
      )}

      {/* 멤버 추가 모달 */}
      {isAddModalOpen && (
        <AddMemberModal
          plannerId={plannerId}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TeamManagementTab;
