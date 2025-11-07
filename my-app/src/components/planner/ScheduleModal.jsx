// src/components/planner/ScheduleModal.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlannerContext } from "../../hooks/PlannerContext";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import ScheduleFormModal from "./ScheduleFormModal";
import { MapPin, Pencil, X, NotepadText, Clock, Clock2 } from "lucide-react";

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

  // 🔥 현재 플래너 타입에 맞는 훅 사용
  const { fetchDailySchedules, fetchScheduleDetail } =
    useCurrentPlanner(plannerType);

  // ==================== State ====================
  const [openEditModal, setOpenEditModal] = useState(false);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== 일정 상세 불러오기 ====================
  useEffect(() => {
    if (!openScModal || !selectedSc || !nowPlanner) return;

    const loadScheduleDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("📋 일정 상세 로딩:", {
          plannerId: nowPlanner,
          scheduleId: selectedSc,
          plannerType,
        });

        // 🔥 일정 상세 조회
        const detail = await fetchScheduleDetail(nowPlanner, selectedSc);

        if (detail) {
          console.log("✅ 일정 상세 로드 성공:", detail);
          setScheduleDetail(detail);
        } else {
          throw new Error("일정을 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("❌ 일정 상세 로드 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadScheduleDetail();
  }, [openScModal, selectedSc, nowPlanner, plannerType, fetchScheduleDetail]);

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
    setOpenScModal(false);
    setOpenEditModal(true);
  };

  const handleScheduleUpdated = async () => {
    console.log("✅ 일정 수정 성공!");

    // 🔥 일정 다시 불러오기
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p className="text-gray-500">일정 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        onClick={backDropClick}
      >
        <div className="bg-white p-6 rounded-lg">
          <p className="text-gray-500">일정 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  // ==================== Render ====================
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={backDropClick}
      >
        <div
          className="bg-white p-6 rounded-lg max-w-lg mx-auto mt-48 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            {/* 닫기 버튼 */}
            <X
              className="absolute cursor-pointer -right-2.5 -top-4 hover:text-red-500 transition-colors"
              onClick={handleClose}
              size={24}
            />

            {/* 카테고리 (있으면 표시) */}
            {scheduleDetail.categoryName && (
              <h1 className="font-medium text-sm text-gray-700">
                📁 {scheduleDetail.categoryName}
              </h1>
            )}

            {/* 제목 */}
            <h1 className="font-bold text-2xl mb-6">{scheduleDetail.title}</h1>

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
                  <MapPin size={18} className="text-green-500" />
                  <h2 className="font-medium">장소:</h2>
                  <span>{scheduleDetail.location}</span>
                </div>
              )}

              {/* 메모 */}
              {scheduleDetail.memo && (
                <div className="flex items-start gap-2">
                  <NotepadText size={18} className="text-purple-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">메모:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {scheduleDetail.memo}
                    </p>
                  </div>
                </div>
              )}

              {/* 🔥 공유 플래너일 때만 참여자 표시 */}
              {plannerType === "shared" && scheduleDetail.participants && (
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">참여자:</h3>
                    <div className="flex flex-wrap gap-2">
                      {scheduleDetail.participants.map((participant, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {participant.nickname || participant.username}
                        </span>
                      ))}
                    </div>
                  </div>
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
