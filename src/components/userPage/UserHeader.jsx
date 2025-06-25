import { Menu, X } from "lucide-react";
import useWindowWidth from "../../hooks/useWindowWidth";
import React, { useState } from "react";

function UserHeader() {
  const width = useWindowWidth();
  const [showHeader, setShowHeader] = useState(false);

  return (
    <div className="px-4 py-4 md:mt-4 flex justify-between relative overflow-x-hidden text-blackText ">
      <div className="w-6 h-6 bg-blue-500"></div>
      {width < 600 ? (
        <div className="relative z-50">
          {showHeader ? (
            <X size={26} className="cursor-pointer" onClick={() => setShowHeader(false)} />
          ) : (
            <Menu size={26} className="cursor-pointer" onClick={() => setShowHeader(true)} />
          )}

          <div
            className={`fixed top-0 right-0 h-full w-2/3 max-w-xs bg-slate-200 shadow-lg px-6 py-6 transition-transform duration-300 ease-in-out border-l border-slate-300
            ${showHeader ? "translate-x-0" : "translate-x-full"}`}
          >
            <ul className="flex flex-col gap-4 pt-10 relative">
              <X size={26} className="cursor-pointer absolute top-0 right-0" onClick={() => setShowHeader(false)} />
              <li className="cursor-pointer opacity-75 transition-all hover:opacity-100">Strona główna</li>
              <li className="cursor-pointer opacity-75 transition-all hover:opacity-100">Profil</li>
              <li className="cursor-pointer opacity-75 transition-all hover:opacity-100">Wyloguj się</li>
            </ul>
          </div>

          
        </div>
      ) : (
        <div className="w-full flex gap-8 justify-end ">
                <p className="cursor-pointer opacity-75 transition-all hover:opacity-100">Strona główna</p>
              <p className="cursor-pointer opacity-75 transition-all hover:opacity-100">Profil</p>
              <p className="cursor-pointer opacity-75 transition-all hover:opacity-100">Wyloguj się</p>
        </div>
      )}
    </div>
  );
}

export default UserHeader;
