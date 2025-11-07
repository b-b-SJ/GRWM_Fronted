import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlannerSidebar from "../../layout/PlannerSidebar";
import PlannerHeaderWM from "../../planner/PlannerHeaderWM";
import ScheduleModal from "../../planner/ScheduleModal";
import { useTeamPlanner } from "../../../hooks/TeamPlannerProvider";
import TeamMemberSidebar from "../../planner/teamPlanner/TeamMemberSidebar";
import { usePlannerContext } from "../../../hooks/PlannerContext";
import { usePersonalPlanner } from "../../../hooks/PersonalPlannerProvider";

const PlannerMain = ({ sidebarOpen }) => {
  const navigate = useNavigate();

  // Context에서 필요한 것들 가져오기
  const {
    openScModal,
    nowPlanner,
    setNowPlanner,
    plannerType,
    isShared,
    isPersonal,
  } = usePlannerContext();
  const teamData = useTeamPlanner();
  const personalData = usePersonalPlanner();

  const currentData = isShared ? teamData : personalData;
  //항상 호출!
  const { currentPlanner, setCurrentPlanner, planners, fetchPlanners } =
    currentData;

  // URL에서 플래너 ID 가져오기
  const { plannerId } = useParams();

  // URL의 plannerId를 Context에 동기화
  useEffect(() => {
    if (!plannerId) return;

    const plannerIdNum = Number(plannerId);
    setNowPlanner(plannerIdNum);

    console.log(` ${plannerType} 플래너 설정:`, plannerIdNum);
  }, [plannerId, setNowPlanner, plannerType]);

  // Shared 플래너일 때만 TeamPlanner 데이터 로드
  useEffect(() => {
    // Personal이면 실행 안 함
    //-> 훅 생성하면 추가!
    if (!isShared || !plannerId) return;

    const loadTeamPlanner = async () => {
      const plannerIdNum = Number(plannerId);

      console.log(" 팀 플래너 로딩:", plannerIdNum);

      // 이미 로드된 플래너인지 확인
      const existing = planners?.find((p) => p.plannerId === plannerIdNum);

      if (existing) {
        console.log("캐시된 플래너 사용:", existing.title);
        setCurrentPlanner(existing);
      } else {
        console.log("플래너 목록 새로 불러오기...");
        await fetchPlanners();

        // 다시 찾기 (fetchPlanners 후 planners 업데이트됨)
        const planner = planners?.find((p) => p.plannerId === plannerIdNum);

        if (planner) {
          console.log(" 플래너 로드 성공:", planner.title);
          setCurrentPlanner(planner);
        } else {
          console.error("플래너를 찾을 수 없습니다:", plannerIdNum);
          navigate(`/planner/list/${plannerType}`);
        }
      }
    };

    loadTeamPlanner();
  }, [
    isShared,
    plannerId,
    planners,
    setCurrentPlanner,
    fetchPlanners,
    navigate,
    plannerType,
  ]);

  // 디버깅용 로그
  useEffect(() => {
    console.log(" 현재 상태:", {
      plannerType,
      isShared,
      isPersonal,
      nowPlanner,
      currentPlanner: currentPlanner?.title || "없음",
    });
  }, [plannerType, isShared, isPersonal, nowPlanner, currentPlanner]);

  return (
    <div className="flex flex-1">
      {/* 왼쪽 사이드바 (공통) */}
      {sidebarOpen && <PlannerSidebar sidebarClassName="md:block hidden" />}

      {/* 메인 플래너 영역 (공통) */}
      <div className="flex-1 flex flex-col">
        <PlannerHeaderWM />
      </div>

      {/* 오른쪽 사이드바 - 공유 플래너일 때만 표시 */}
      {isShared && <TeamMemberSidebar plannerId={nowPlanner} />}

      {/* 일정 모달 (공통) */}
      {openScModal && <ScheduleModal />}
    </div>
  );
};

export default PlannerMain;
