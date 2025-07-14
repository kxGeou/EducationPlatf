import useWindowWidth from "../../hooks/useWindowWidth";
import { Menu } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

function RedHeader() {
  const navigate = useNavigate();
  const width = useWindowWidth();

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-[1100px] text-darkerBlack flex items-center px-6 justify-center z-50">
      <div className="bg-slate-700/20 border border-white/50 backdrop-blur-lg w-full py-2 px-4 rounded-[12px] flex justify-between items-center">
        <div className="w-8 h-8 bg-primaryGreen rounded-full"></div>
        <div>
          {width > 800 ? (
            <div></div>
          ) : (
            <Menu size={30} className="text-white cursor-pointer transiton-all duration-300 hover:text-primaryGreen" />
          )}
        </div>
      </div>
    </header>
  );
}

export default RedHeader;
