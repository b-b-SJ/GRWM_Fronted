//메인 탐라
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePost } from "../../hooks/usePost";
const MainTimeLine = () => {
  //들어간 유저 프로필 = 본인 프로필이면 편집 권한 제공?
  const post = usePost();
  return (
    <div>
      <h1 className="bg-blue-400">장래희망: 듀...아리파</h1>
      <Link to="/community/profile">
        <button>
          {/* 링크에 profile붙는 식으로 만들어야될듯 */}
          프로필로 가자긔
        </button>
      </Link>
    </div>
  );
};

export default MainTimeLine;
