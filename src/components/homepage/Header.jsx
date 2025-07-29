import useWindowWidth from "../../hooks/useWindowWidth";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function RedHeader() {
  const [visibleModal, setVisibleModal] = useState(false);
  const width = useWindowWidth();
  const navigate = useNavigate();

  const user = useAuthStore(state => state.user);
  const purchasedCourses = useAuthStore(state => state.purchasedCourses);
  const loading = useAuthStore(state => state.loading);
  const error = useAuthStore(state => state.error);

  const userName = user?.user_metadata?.full_name;

  useEffect(() => {
    console.log("Auth debug:", { user, purchasedCourses, loading, error });
  }, [user, purchasedCourses, loading, error]);

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-[1100px] text-darkerBlack flex flex-col px-6 justify-center z-50">
      <div className="bg-slate-950/35 border border-slate-500/25 backdrop-blur-md  w-full py-[9px] px-3 rounded-[12px] flex justify-between items-center shadow-lg">
        <div className="w-8 h-8 bg-primaryGreen cursor-pointer rounded-full" onClick={() => navigate('/')} title="Logo platformy"></div>
        <div>
          {width > 800 && (
            <ul className="flex gap-8 items-center text-white">
              <li className="cursor-pointer hover:text-gray-300">O nas</li>
              <li className="cursor-pointer hover:text-gray-300">Osiągnięcia</li>
              <li className="cursor-pointer hover:text-gray-300">Kursy</li>
              <li className="cursor-pointer hover:text-gray-300">Opinie</li>
              <li onClick={() => navigate("/blog")} className="cursor-pointer hover:text-gray-300">Blog</li>
              <li onClick={() => navigate("/zasoby")} className="cursor-pointer hover:text-gray-300">Arkusze</li>
              {userName ? (
                <li
                  className="flex items-center gap-3 bg-gradient-to-r to-primaryGreen from-secondaryGreen px-4 cursor-pointer py-[5px] rounded-[8px] hover:scale-[1.025]"
                  onClick={() => navigate("/user_page")}
                >
                  {userName}
                  <User size={18} />
                </li>
              ) : (
                <li
                  className="bg-gradient-to-r to-primaryGreen from-secondaryGreen px-5 py-[5px] rounded-[12px] cursor-pointer hover:scale-[1.025]"
                  onClick={() => navigate("/user_page")}
                >
                  Zaloguj się
                </li>
              )}
            </ul>
          )}

          {width <= 800 && (
            <span>
              {visibleModal ? (
                <X
                  onClick={() => setVisibleModal(false)}
                  size={30}
                  className="text-white cursor-pointer hover:text-gray-400"
                />
              ) : (
                <Menu
                  size={30}
                  className="text-white cursor-pointer hover:text-gray-400"
                  onClick={() => setVisibleModal(true)}
                />
              )}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {visibleModal && width <= 800 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-2 w-full"
          >
            <div className="bg-slate-950/35 border border-slate-500/25 backdrop-blur-lg rounded-[12px] px-6 py-4 text-white shadow-lg">
              <ul className="flex flex-col gap-3 items-start text-white">
                <li className="cursor-pointer hover:text-gray-300">O nas</li>
                <li className="cursor-pointer hover:text-gray-300">Osiągnięcia</li>
                <li className="cursor-pointer hover:text-gray-300">Kursy</li>
                <li className="cursor-pointer hover:text-gray-300">Opinie</li>
                <li onClick={() => navigate("/blog")} className="cursor-pointer hover:text-gray-300">Blog</li>
                <li onClick={() => navigate("/zasoby")} className="cursor-pointer hover:text-gray-300">Arkusze</li>
                {userName ? (
                  <li
                    className="flex items-center gap-3 w-full bg-gradient-to-r to-primaryGreen from-secondaryGreen px-4 cursor-pointer py-[5px] rounded-[8px] hover:scale-[1.025]"
                    onClick={() => navigate("/user_page")}
                  >
                    {userName}
                    <User size={18} />
                  </li>
                ) : (
                  <li
                    className="bg-gradient-to-r w-full to-primaryGreen from-secondaryGreen px-5 py-[5px] rounded-[12px] cursor-pointer hover:scale-[1.025]"
                    onClick={() => navigate("/user_page")}
                  >
                    Zaloguj się
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default RedHeader;
