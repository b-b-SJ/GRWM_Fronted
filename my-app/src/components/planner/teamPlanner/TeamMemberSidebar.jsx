import { useState, useEffect } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import MemberCard from "./MemberCard";
import AddMemberModal from "./AddMemberModal";
import { Users, UserPlus, Funnel, Check } from "lucide-react";
import { useAuth } from "../../../hooks/AuthContext";
import { usePlannerContext } from "../../../hooks/PlannerContext";

const TeamMemberSidebar = ({ plannerId }) => {
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
  }, []);

  // ✅ 필터링 모드 꺼질 때 초기화
  useEffect(() => {
    if (!memberScFilterMode) {
      setSelectedMember(null);
      setMemberFilteredSchedules(null);
    }
  }, [memberScFilterMode]);

  // 현재 사용자가 이 플래너에서 manager인지 확인
  const currentUserMember = members.find((m) => m.userId === user?.userId);
  const isManager = currentUserMember?.role === "manager";

  // ✅ 필터 적용 핸들러 (백엔드 API 호출)
  const handleApplyFilter = async () => {
    if (selectedMember === null) {
      // 전체 보기 - 필터 초기화
      setMemberFilteredSchedules(null);
      return;
    }

    setApplyLoading(true);
    try {
      console.log("🔍 멤버별 일정 검색:", {
        plannerId,
        userId: selectedMember,
      });

      // ✅ 백엔드에서 해당 멤버가 참여 중인 일정만 가져오기
      const schedules = await searchSchedulesByUser(plannerId, selectedMember);

      console.log("✅ 검색 결과:", schedules);

      // Context에 저장 (Monthly/Weekly에서 사용)
      setMemberFilteredSchedules(schedules);
    } catch (err) {
      console.error("❌ 멤버별 일정 검색 실패:", err);
      alert("일정 검색에 실패했습니다: " + err.message);
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="w-80 border-l bg-white h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        {/* ========== 팀원 관리 ========== */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-600" />
            <h2 className="font-bold text-lg">팀원 관리</h2>
          </div>
          <span className="text-sm text-gray-500">{members.length}명</span>
        </div>

        {/* 권한 상태 표시 */}
        {currentUserMember && (
          <div className="mb-2 text-xs text-gray-500">
            내 역할: {currentUserMember.role === "manager" ? "관리자" : "멤버"}
          </div>
        )}

        {/* 멤버 추가 버튼 (manager만) */}
        {isManager && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus size={18} />
            <span>팀원 초대</span>
          </button>
        )}

        {/* 권한 없을 때 안내 */}
        {!isManager && members.length > 0 && (
          <div className="text-xs text-gray-500 text-center py-2">
            팀원 초대는 관리자만 가능합니다
          </div>
        )}
        {/* ========== 팀원별 일정 보기 ========== */}
        <div className="py-3 border-t mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Funnel size={20} className="text-gray-600" />
            <h2 className="font-bold text-lg">팀원별 일정 보기</h2>
            <input
              type="checkbox"
              checked={memberScFilterMode}
              onChange={(e) => setMemberScFilterMode(e.target.checked)}
              className="ml-auto w-4 h-4"
            />
          </div>

          {/* ✅ 필터링 모드일 때 적용 버튼 표시 */}
          {memberScFilterMode && (
            <div className="mt-2">
              {/* 전체 보기 옵션 */}
              <label className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mt-2">
                <input
                  type="radio"
                  name="memberFilter"
                  checked={selectedMember === null}
                  onChange={() => setSelectedMember(null)}
                  className="w-4 h-4 flex-shrink-0"
                />
                <div className="font-medium text-sm">전체 일정</div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 로딩/에러 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      )}

      {error && <div className="p-4 text-red-500 text-sm">에러: {error} </div>}

      {/* ========== 멤버 카드 목록 (관리용) ========== */}
      <div className="p-4 space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.userId}
            member={member}
            plannerId={plannerId}
            isManager={isManager}
            user={user}
            showRadio={memberScFilterMode} // ✅ 라디오 버튼 표시 여부
            isSelected={selectedMember === member.userId} // ✅ 선택 상태
            onSelect={() => setSelectedMember(member.userId)} // ✅ 선택 핸들러
          />
        ))}

        {members.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">팀원이 없습니다</div>
        )}
      </div>

      {/* ✅ 적용 버튼 */}
      {memberScFilterMode && (
        <div className="p-4 bg-white z-10">
          <button
            onClick={handleApplyFilter}
            disabled={applyLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
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

export default TeamMemberSidebar;
