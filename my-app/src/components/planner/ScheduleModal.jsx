// src/components/planner/ScheduleModal.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlannerContext } from "../../hooks/PlannerContext";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import { useTeamPlanner } from "../../hooks/TeamPlannerProvider";
import { useAuth } from "../../hooks/AuthContext";
import ScheduleFormModal from "./ScheduleFormModal";
import {
  MapPin,
  Pencil,
  X,
  NotepadText,
  Clock,
  Clock2,
  Users,
  UserPlus,
  UserMinus,
  User,
} from "lucide-react";

const ScheduleModal = () => {
  const {
    openScModal,
    setOpenScModal,
    selectedSc,
    setSelectedSc,
    plannerType,
    currentDate,
  } = usePlannerContext();

  const { plannerId } = useParams();
  const nowPlanner = Number(plannerId);

  const { fetchScheduleDetail } = useCurrentPlanner(plannerType);

  //팀 플래너 전용 기능
  const { addScheduleMember, removeScheduleMember } = useTeamPlanner();

  // 현재 사용자 정보
  const { user } = useAuth();

  // ==================== State ====================
  const [openEditModal, setOpenEditModal] = useState(false);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participantLoading, setParticipantLoading] = useState(false);

  // ==================== 일정 상세 불러오기 ====================
  useEffect(() => {
    if (!openScModal || !selectedSc || !nowPlanner) return;

    const loadScheduleDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("✅ 일정 상세 로딩:", {
          plannerId: nowPlanner,
          scheduleId: selectedSc,
          plannerType,
        });

        //  일정 상세 조회
        const detail = await fetchScheduleDetail(nowPlanner, selectedSc);

        if (detail) {
          console.log(" 일정 상세 로드 성공:", detail);
          setScheduleDetail(detail);
        } else {
          throw new Error("일정을 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error(" 일정 상세 로드 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadScheduleDetail();
  }, [openScModal, selectedSc, nowPlanner, plannerType, fetchScheduleDetail]);

  // ==================== 참여자 관리 ====================

  // 현재 사용자가 참여 중인지 확인
  const isParticipating = scheduleDetail?.members?.some(
    (p) => p.userId === user?.userId
  );

  // 참여하기
  const handleJoinSchedule = async () => {
    if (!nowPlanner || !selectedSc) return;

    setParticipantLoading(true);
    try {
      console.log(" 일정 참여 시도:", {
        plannerId: nowPlanner,
        scheduleId: selectedSc,
      });

      const updatedMembers = await addScheduleMember(nowPlanner, selectedSc);

      if (updatedMembers) {
        console.log("참여 성공! 업데이트된 멤버:", updatedMembers);

        // 일정 상세 다시 불러오기
        const detail = await fetchScheduleDetail(nowPlanner, selectedSc);
        setScheduleDetail(detail);
      }
    } catch (err) {
      console.error("참여 실패:", err);
      alert("일정 참여에 실패했습니다: " + err.message);
    } finally {
      setParticipantLoading(false);
    }
  };

  // 나가기
  const handleLeaveSchedule = async () => {
    if (!nowPlanner || !selectedSc) return;

    if (!window.confirm("이 일정에서 나가시겠습니까?")) return;

    setParticipantLoading(true);
    try {
      console.log(" 일정 나가기 시도:", {
        plannerId: nowPlanner,
        scheduleId: selectedSc,
      });

      await removeScheduleMember(nowPlanner, selectedSc);

      console.log("나가기 성공!");

      // 일정 상세 다시 불러오기
      const detail = await fetchScheduleDetail(nowPlanner, selectedSc);
      setScheduleDetail(detail);
    } catch (err) {
      console.error(" 나가기 실패:", err);
      alert("일정 나가기에 실패했습니다: " + err.message);
    } finally {
      setParticipantLoading(false);
    }
  };

  // ==================== Handlers ====================
  const handleClose = () => {
    setOpenScModal(false);
    setSelectedSc(null);
    setScheduleDetail(null);
    setError(null);
  };

  const backDropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleEditClick = () => {
    setOpenEditModal(true);
  };

  const handleScheduleUpdated = async () => {
    console.log("✅ 일정 수정 성공!");

    // ✅ 일정 다시 불러오기
    if (selectedSc && nowPlanner) {
      const detail = await fetchScheduleDetail(nowPlanner, selectedSc);
      setScheduleDetail(detail);
    }

    setOpenEditModal(false);
    setOpenScModal(true);
  };

  const renderTime = (timeString) => {
    if (!timeString) return "";
    const time = new Date(timeString);
    return `${time.getFullYear()}년 ${
      time.getMonth() + 1
    }월 ${time.getDate()}일 ${timeString.slice(11, 16)}`;
  };

  // ==================== Early Returns ====================
  if (!openScModal) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white p-6 rounded-lg">
          <p className="text-gray-500">일정 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
        onClick={backDropClick}
      >
        <div className="bg-white p-6 rounded-lg max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-red-500">오류</h2>
            <X
              className="cursor-pointer hover:text-red-500"
              onClick={handleClose}
            />
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  if (!scheduleDetail) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
        onClick={backDropClick}
      >
        <div className="bg-white p-6 rounded-lg">
          <p className="text-gray-500">일정 정보가 없습니다.</p>
        </div>
      </div>
    );
  }
  console.log("카테고리 디테일", scheduleDetail);
  // ==================== Render ====================
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={backDropClick}
      >
        <div
          className="bg-white p-6 rounded-lg max-w-lg mx-auto mt-48 relative max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            {/* 닫기 버튼 */}
            <X
              className="absolute cursor-pointer right-4 top-4 hover:text-red-500 transition-colors"
              onClick={handleClose}
              size={24}
            />

            {/* 제목 */}
            <h1 className="font-bold text-2xl mb-6">{scheduleDetail.title}</h1>

            {/* 작성자 표시 */}

            {/* 일정 상세 정보 */}
            <div className="text-md space-y-3 mt-6">
              {/* 시작 시간 */}
              <div className="flex items-center gap-2">
                <Clock size={17} className="text-blue-500" />
                <h2 className="font-medium">시작:</h2>
                <span>{renderTime(scheduleDetail.startDateTime)}</span>
              </div>

              {/* 종료 시간 */}
              <div className="flex items-center gap-2">
                <Clock2 size={17} className="text-red-500" />
                <h2 className="font-medium">종료:</h2>
                <span>{renderTime(scheduleDetail.finishDateTime)}</span>
              </div>

              {/* 장소 */}
              {scheduleDetail.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="" />
                  <h2 className="font-medium">장소:</h2>
                  <span>{scheduleDetail.location}</span>
                </div>
              )}

              {/* 메모 */}
              {scheduleDetail.memo && (
                <div className="flex items-start gap-2">
                  <NotepadText size={18} className="mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">메모:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {scheduleDetail.memo}
                    </p>
                  </div>
                </div>
              )}
              {/* 카테고리 (있으면 표시) */}
              {scheduleDetail.category.categoryName && (
                <h1 className=" text-sm text-gray-700 text-end">
                  {`📂 ${scheduleDetail.category.categoryName}`}
                </h1>
              )}
              {/*  공유 플래너일 때만 참여자 표시 */}
              {plannerType === "shared" && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-blue-500" />
                      <h3 className="font-semibold">
                        참여자 ({scheduleDetail.members?.length || 0}명)
                      </h3>
                      {scheduleDetail.creator && (
                        <h1 className="font-medium text-xs text-gray-600">
                          {`작성자: ${scheduleDetail.creator.username}`}
                        </h1>
                      )}
                    </div>

                    {/* 참여하기/나가기 버튼 */}
                    {isParticipating ? (
                      <button
                        onClick={handleLeaveSchedule}
                        disabled={participantLoading}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <UserMinus size={16} />
                        나가기
                      </button>
                    ) : (
                      <button
                        onClick={handleJoinSchedule}
                        disabled={participantLoading}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <UserPlus size={16} />
                        참여하기
                      </button>
                    )}
                  </div>

                  {/* 참여자 카드 리스트 */}
                  {scheduleDetail.members &&
                  scheduleDetail.members.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {scheduleDetail.members.map((participant) => (
                        <div
                          key={participant.userId}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                            participant.userId === user?.userId
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          {participant.profileImage ? (
                            <img
                              src={participant.profileImage}
                              alt={participant.nickname}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500 font-bold" />
                            </div>
                          )}
                          <span className="text-sm font-medium">
                            {participant.username}
                            {participant.userId === user?.userId && " (나)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      아직 참여자가 없습니다. 첫 참여자가 되어보세요!
                    </p>
                  )}

                  {participantLoading && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      처리 중...
                    </p>
                  )}
                </div>
              )}

              {/* 수정 버튼 */}
              <div className="flex justify-end pt-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={handleEditClick}
                >
                  수정하기
                  <Pencil size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 일정 수정 모달 ==================== */}
      <ScheduleFormModal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setOpenScModal(true); // 상세보기 모달 다시 열기
        }}
        mode="edit"
        plannerId={nowPlanner}
        plannerType={plannerType}
        scheduleId={selectedSc}
        initialData={scheduleDetail}
        onSuccess={handleScheduleUpdated}
      />
    </>
  );
};

export default ScheduleModal;
