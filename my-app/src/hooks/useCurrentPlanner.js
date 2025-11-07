import { useTeamPlanner } from "./TeamPlannerProvider";
import { usePersonalPlanner } from "./PersonalPlannerProvider";
import { usePlannerContext } from "./PlannerContext";

export function useCurrentPlanner(typeParam) {
  const teamData = useTeamPlanner();
  const personalData = usePersonalPlanner();
  const { plannerType: contextType } = usePlannerContext();

  const type = typeParam || contextType;
  const isShared = type === "shared";

  return isShared ? teamData : personalData;
}
