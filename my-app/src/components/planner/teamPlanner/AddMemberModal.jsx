import { useState } from "react";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import { X, Search } from "lucide-react";

const AddMemberModal = ({ plannerId, onClose }) => {
  const { addMember, findUserIdByLoginId } = useTeamPlanner();

  const [memberId, setMemberId] = useState("");
  const [role, setRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!memberId.trim()) {
      alert("사용자 ID를 입력해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      const memberUserId = await findUserIdByLoginId(memberId);
      await addMember(plannerId, Number(memberUserId), role);
      alert("팀원이 추가되었습니다!");
      onClose();
    } catch (error) {
      alert("추가 실패: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">팀원 초대</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 사용자 ID 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              사용자 ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="초대할 사용자의 ID를 입력하세요"
                className="w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              로그인에 사용되는 아이디를 입력해주세요!
            </p>
          </div>

          {/* 역할 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">역할 선택</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={role === "member"}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">멤버</div>
                  <div className="text-xs text-gray-500">
                    일정 조회 및 참여 가능
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={role === "manager"}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">관리자</div>
                  <div className="text-xs text-gray-500">
                    일정 생성/수정/삭제 및 팀원 관리 가능
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isSubmitting ? "초대 중..." : "초대하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
