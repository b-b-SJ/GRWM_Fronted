import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
const PlannerListPage = () => {
  const { type } = useParams(); // "shared" 또는 "personal"

  return (
    <div>{type === "shared" ? "공유 플래너 목록" : "개인 플래너 목록"}</div>
  );
};
export default PlannerListPage;
