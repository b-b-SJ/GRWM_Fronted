//사이드바
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const CommunitySidebar = () => {
  return (
    <div className="w-80 border-r flex flex-col">
      <h1> 사이드바인디밴드</h1>
      <Link to="/community/search">
        <button>
          <Search />
          돋보기
        </button>
      </Link>
    </div>
  );
};

export default CommunitySidebar;
