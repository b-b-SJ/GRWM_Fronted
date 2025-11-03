import { useState, useEffect } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import MemberCard from "./MemberCard";
import AddMemberModal from "./AddMemberModal";
import { Users, UserPlus } from "lucide-react";
import { useAuth } from "../../../hooks/AuthContext";

const TeamMemberSidebar = ({ plannerId }) => {
  const { members, fetchMembers, loading, error, currentPlanner } =
    useTeamPlanner();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 플래너가 선택되면 멤버 목록 불러오기
  useEffect(() => {
    if (plannerId) {
      fetchMembers(plannerId);
    }
  }, [plannerId]);

  // 현재 사용자가 이 플래너에서 manager인지 확인
  const currentUserMember = members.find((m) => m.userId === user?.userId);
  const isManager = currentUserMember?.role === "manager";
  console.log("관리자임까?", isManager, currentUserMember, members, user);
  console.log("뭐가 들었누", localStorage.getItem("userData"));
  return (
    <div className="w-80 border-l bg-white h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-600" />
            <h2 className="font-bold text-lg">팀원 관리</h2>
          </div>
          <span className="text-sm text-gray-500">{members.length}명</span>
        </div>

        {/* ✅ 권한 상태 표시 (디버깅용 - 나중에 삭제 가능) */}
        {currentUserMember && (
          <div className="mb-2 text-xs text-gray-500">
            내 역할: {currentUserMember.role === "manager" ? "관리자" : "멤버"}
          </div>
        )}

        {/* ✅ 멤버 추가 버튼 (manager만) */}
        {isManager && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus size={18} />
            <span>팀원 초대</span>
          </button>
        )}

        {/* ✅ 권한 없을 때 안내 메시지 */}
        {!isManager && members.length > 0 && (
          <div className="text-xs text-gray-500 text-center py-2">
            팀원 초대는 관리자만 가능합니다
          </div>
        )}
      </div>

      {/* 로딩/에러 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      )}

      {error && <div className="p-4 text-red-500 text-sm">에러: {error}</div>}

      {/* 멤버 목록 */}
      <div className="p-4 space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.userId}
            member={member}
            plannerId={plannerId}
            isManager={isManager}
            user={user}
          />
        ))}

        {members.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">팀원이 없습니다</div>
        )}
      </div>

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
