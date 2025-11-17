import React, { useState } from "react";
import { Clock, MapPin, Trash, Loader2 } from "lucide-react";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";
import { usePlannerContext } from "../../hooks/PlannerContext";
const ScheduleListSidebar = ({
  className = "",

  todaySc,
  onScheduleDeleted, // ✅ 삭제 후 콜백
}) => {
  const [deletingId, setDeletingId] = useState(null); // 삭제 중인 일정 ID
  const {
    nowPlanner,
    openScModal,
    setOpenScModal,
    selectedSc,
    setSelectedSc,
    plannerType,
  } = usePlannerContext();
  const { deleteSchedule, loading } = useCurrentPlanner(plannerType);

  // ✅ 시간 라벨 생성 함수
  const getLabelStartEnd = (sc) => {
    if (!sc || !Array.isArray(sc)) return [];

    const now = new Date();

    return sc.map((schedule) => {
      const sdt = new Date(schedule.startDateTime);
      const edt = new Date(schedule.finishDateTime);

      let label = "";

      if (now <= sdt) {
        const hour = sdt.getHours();
        const min = sdt.getMinutes() > 0 ? ` ${sdt.getMinutes()}분` : ``;
        label =
          hour > 12
            ? `오후 ${hour - 12}시${min} 시작`
            : `오전 ${hour}시${min} 시작`;
      } else if (now.toDateString() === edt.toDateString()) {
        const hour = edt.getHours();
        const min = edt.getMinutes() > 0 ? ` ${edt.getMinutes()}분` : ``;
        label =
          hour > 12
            ? `오후 ${hour - 12}시${min} 종료`
            : `오전 ${hour}시${min} 종료`;
      } else {
        label = "오늘 하루종일";
      }

      return {
        ...schedule,
        label,
      };
    });
  };

  // ✅ 일정 삭제 핸들러
  const handleDelete = async (scheduleId) => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) {
      return;
    }

    setDeletingId(scheduleId);

    try {
      console.log(`일정 ${scheduleId} 삭제 시작...`);
      await deleteSchedule(nowPlanner, scheduleId);
      console.log("일정 삭제 성공!");

      // ✅ 부모 컴포넌트에 삭제 완료 알림
      if (onScheduleDeleted) {
        onScheduleDeleted(scheduleId);
      }
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      alert("일정 삭제에 실패했습니다");
    } finally {
      setDeletingId(null);
    }
  };

  const todayScheSideTime = getLabelStartEnd(todaySc);

  return (
    <div className="rounded-2xl">
      {/* 일정 영역 */}
      <div className={`p-3 overflow-y-auto ${className} space-y-3`}>
        {/*일정 로딩 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">일정 불러오는 중...</p>
          </div>
        ) : todayScheSideTime && todayScheSideTime.length > 0 ? (
          todayScheSideTime.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className={`p-3 bg-gray-100 rounded-xl relative ${
                deletingId === schedule.scheduleId ? "opacity-50" : ""
              }`}
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  setOpenScModal(true);
                  setSelectedSc(schedule.scheduleId);
                }}
              >
                <h3 className="text-md font-medium mb-2">{schedule.title}</h3>
                <div className="flex text-xs text-gray-900 gap-2">
                  <div className="flex gap-1 items-center">
                    <Clock size={14} />
                    {schedule.label}
                  </div>
                  {schedule.location && (
                    <div className="flex gap-1 items-center">
                      <MapPin size={14} />
                      {schedule.location}
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ 삭제 버튼 */}
              <button
                className="absolute top-2 right-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // 부모의 onClick 이벤트 방지
                  handleDelete(schedule.scheduleId);
                }}
                disabled={deletingId === schedule.scheduleId}
                title="일정 삭제"
              >
                <Trash size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <div>오늘 일정이 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleListSidebar;
{
  /*
//객체 기준.

   const getLabelStartEnd = (sc) => {
    const now = new Date(); //혹시나 재활용할 수 있을까 싶어서 new Date()대신에 new Date(sc.date)를 넣었었는데
    //기본이 9시로 설정 되어있어서 계속 안되더라

    return sc.schedules.map((schedule) => {
      //기존에서 label을 추가한 객체 생성
      const sdt = new Date(schedule.startDateTime);
      const edt = new Date(schedule.finishDateTime);

      let label = "";

      if (now <= sdt) {
        const hour = sdt.getHours();
        const min = sdt.getMinutes() > 0 ? ` ${sdt.getMinutes()}분` : ``;
        label =
          hour > 12
            ? `오후 ${hour - 12}시${min} 시작`
            : `오전 ${hour}시${min} 시작`;
      } else if (now.toDateString() === edt.toDateString()) {
        const hour = edt.getHours();
        const min = edt.getMinutes() > 0 ? ` ${edt.getMinutes()}분` : ``;
        label =
          hour > 12
            ? `오후 ${hour - 12}시${min} 종료`
            : `오전 ${hour}시${min} 종료`;
      } else {
        label = "오늘 하루종일";
      }

      return {
        ...schedule, // 원래 schedule 정보
        label, // 추가된 시간 정보
      };
    });
  };
  
  */
}
