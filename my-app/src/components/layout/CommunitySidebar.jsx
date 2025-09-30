//사이드바
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const CommunitySidebar = () => {
  return (
    <div className="xl:block hidden">
      <div className="min-w-80 border-r flex flex-col h-full bg-white">
        <h1> 사이드바인디밴드</h1>
        <Link to="/community/search">
          <button>
            <Search />
            돋보기
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CommunitySidebar;
