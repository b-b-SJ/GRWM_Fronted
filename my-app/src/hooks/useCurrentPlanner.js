import { useTeamPlanner } from "./TeamPlannerProvider";
import { usePersonalPlanner } from "./PersonalPlannerProvider";

export function useCurrentPlanner(type) {
  const teamData = useTeamPlanner();
  const personalData = usePersonalPlanner();

  const isShared = type === "shared";

  // 🔥 타입에 맞는 데이터 반환!
  return isShared ? teamData : personalData;
}
