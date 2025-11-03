import { useState } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { Crown, User, Edit2, Trash2, Check, X } from "lucide-react";

const MemberCard = ({ member, plannerId, isManager }) => {
  const {
    removeMember,
    updateMemberNickname,
    // updateMemberRole - 이건 백엔드 API가 있다면 추가
  } = useTeamPlanner();

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(member.nickname || "");
  const [isChangingRole, setIsChangingRole] = useState(false);

  // 별명 수정 저장
  const handleSaveNickname = async () => {
    if (!newNickname.trim()) {
      alert("별명을 입력해주세요");
      return;
    }

    try {
      await updateMemberNickname(plannerId, member.userId, newNickname);
      setIsEditingNickname(false);
      alert("별명이 변경되었습니다!");
    } catch (error) {
      alert("별명 변경 실패: " + error.message);
    }
  };

  // 멤버 삭제
  const handleRemove = async () => {
    if (window.confirm(`${member.username}님을 팀에서 제거하시겠습니까?`)) {
      try {
        await removeMember(plannerId, member.userId);
        alert("팀원이 제거되었습니다");
      } catch (error) {
        alert("제거 실패: " + error.message);
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      {/* 프로필 영역 */}
      <div className="flex items-start gap-3">
        {/* 프로필 이미지 */}
        <div className="relative flex-shrink-0">
          {member.profileImage ? (
            <img
              src={member.profileImage}
              alt={member.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* 역할 뱃지 */}
          {member.role === "manager" && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
              <Crown size={12} className="text-white" />
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="flex-1 min-w-0">
          {/* 별명/이름 */}
          {isEditingNickname ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
              />
              <button
                onClick={handleSaveNickname}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  setIsEditingNickname(false);
                  setNewNickname(member.nickname || "");
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">
                {member.nickname || member.username}
              </h3>
              {isManager && (
                <button
                  onClick={() => setIsEditingNickname(true)}
                  className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
          )}

          {/* 본명 & 이메일 */}
          <p className="text-xs text-gray-500 truncate">{member.username}</p>
          {member.email && (
            <p className="text-xs text-gray-400 truncate">{member.email}</p>
          )}

          {/* 역할 표시 */}
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                member.role === "manager"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {member.role === "manager" ? "관리자" : "멤버"}
            </span>

            {/* 삭제 버튼 (manager만, 본인은 제외) */}
            {isManager && member.role !== "manager" && (
              <button
                onClick={handleRemove}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
