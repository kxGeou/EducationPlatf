import useWindowWidth from "../../hooks/useWindowWidth";
import supabase from "../../util/supabaseClient";
import { Menu, User, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function RedHeader() {
  const [visibleModal, setVisibleModal] = useState(false);
  const width = useWindowWidth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState();

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log("Error fetching user", error);
      return;
    }
    setUserName(data.user.user_metadata.full_name);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-[1100px] text-darkerBlack flex flex-col px-6 justify-center z-50">
      <div className="bg-slate-700/50 border border-white/30 backdrop-blur-md w-full py-2 px-4 rounded-[12px] flex justify-between items-center shadow-md">
        <div className="w-8 h-8 bg-primaryGreen rounded-full"></div>
        <div>
          {width > 800 && (
            <ul className="flex gap-8 items-center text-white">
              <li>O nas</li>
              <li>Osiągnięcia</li>
              <li>Kursy</li>
              <li>Opinie</li>
              <li onClick={() => navigate("/blog")}>Blog</li>
              {userName ? (
                <li
                  className="flex items-center gap-3 bg-gradient-to-r to-primaryGreen from-secondaryGreen px-4 cursor-pointer py-[5px] rounded-[12px]"
                  onClick={() => navigate("/user_page")}
                >
                  {userName}
                  <User size={18} />
                </li>
              ) : (
                <li
                  className="bg-gradient-to-r to-primaryGreen from-secondaryGreen px-5 py-[5px] rounded-[12px] cursor-pointer"
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
                  className="text-white cursor-pointer"
                />
              ) : (
                <Menu
                  size={30}
                  className="text-white cursor-pointer"
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
            <div className="bg-slate-700/50 border border-white/30 backdrop-blur-lg rounded-[12px] px-6 py-4 text-white shadow-lg">
              <ul className="flex flex-col gap-4 text-left font-medium">
                <li className="cursor-pointer" >O nas</li>
                <li className="cursor-pointer" >Osiągnięcia</li>
                <li className="cursor-pointer" >Kursy</li>
                <li className="cursor-pointer" >Opinie</li>
                <li onClick={() => navigate("/blog")}>Blog</li>
                {userName ? (
                  <li
                    className="flex items-center gap-2 bg-gradient-to-r to-primaryGreen from-secondaryGreen px-4 py-2 rounded-[8px] cursor-pointer"
                    onClick={() => {
                      setVisibleModal(false);
                      navigate("/user_page");
                    }}
                  >
                    {userName}
                    <User size={20} />
                  </li>
                ) : (
                  <li
                    className="bg-gradient-to-r to-primaryGreen from-secondaryGreen px-5 py-2 rounded-[8px] cursor-pointer"
                    onClick={() => {
                      setVisibleModal(false);
                      navigate("/user_page");
                    }}
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
