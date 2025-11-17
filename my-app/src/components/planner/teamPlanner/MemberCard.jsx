import { useState } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { useAuth } from "../../../hooks/AuthContext";
import { Crown, User, Edit2, Trash2, Check, X } from "lucide-react";

const MemberCard = ({
  member,
  plannerId,
  isManager,
  showRadio = false, // ✅ 라디오 버튼 표시 여부
  isSelected = false, // ✅ 선택 상태
  onSelect, // ✅ 선택 핸들러
}) => {
  const { removeMember, updateMemberNickname } = useTeamPlanner();
  const { user } = useAuth(); //  현재 로그인 사용자

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(member.nickname || "");

  // 본인인지 확인
  const isMe = Number(member.userId) === Number(user?.userId);

  // 별명 수정/삭제 (빈 문자열도 허용)
  const handleSaveNickname = async () => {
    // 별명이 비어있어도 OK (삭제 가능)
    const trimmedNickname = newNickname.trim();

    try {
      // 빈 문자열이면 본명으로 돌아감
      await updateMemberNickname(
        plannerId,
        member.userId,
        trimmedNickname || member.username
      );
      setIsEditingNickname(false);

      if (trimmedNickname) {
        alert("별명이 변경되었습니다!");
      } else {
        alert("별명이 삭제되었습니다. 본명이 표시됩니다.");
      }
    } catch (error) {
      alert("별명 변경 실패: " + error.message);
    }
  };

  // 별명 삭제 (빈 문자열로 저장)
  const handleRemoveNickname = async () => {
    if (window.confirm("별명을 삭제하시겠습니까? 본명이 표시됩니다.")) {
      try {
        await updateMemberNickname(plannerId, member.userId, member.username);
        setNewNickname("");
        setIsEditingNickname(false);
        alert("별명이 삭제되었습니다!");
      } catch (error) {
        alert("별명 삭제 실패: " + error.message);
      }
    }
  };

  // 멤버 삭제 (관리자만)
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
      {/* ✅ 필터링 모드일 때만 라디오 버튼 표시 */}
      {showRadio && (
        <input
          type="radio"
          name="memberFilter"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 flex-shrink-0"
        />
      )}
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
          {/* 별명 수정 모드 */}
          {isEditingNickname ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveNickname();
                    }
                  }}
                  placeholder="별명 입력"
                  className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
                <button
                  onClick={handleSaveNickname}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="저장"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setIsEditingNickname(false);
                    setNewNickname(member.nickname || "");
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="취소"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 별명 삭제 버튼 */}
              {member.nickname && (
                <button
                  onClick={handleRemoveNickname}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  별명 삭제
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-md truncate">
                {member.username}
              </h3>

              {/* 본인만 별명 수정 가능 */}
              {isMe && (
                <button
                  onClick={() => setIsEditingNickname(true)}
                  className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
          )}

          {/*  (별명이 있을 때만 별명 표시) */}
          {member.nickname && (
            <p className="text-xs text-gray-500 truncate">
              {`(${member.nickname})`}
            </p>
          )}

          {/* 이메일 */}
          {member.email && (
            <p className="text-xs text-gray-400 truncate">{member.email}</p>
          )}

          {/* 역할 & 액션 */}
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

            {/* 관리자는 다른 멤버 삭제 가능 (관리자끼리는 삭제 불가) */}
            {isManager && !isMe && member.role !== "manager" && (
              <button
                onClick={handleRemove}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
                title="팀에서 제거"
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
