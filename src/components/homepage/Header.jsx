import DesktopLogo from "../../assets/logoDesk.png";
import MobileDesktop from "../../assets/logoMobile.png";
import useWindowWidth from "../../hooks/useWindowWidth";
import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, X, Sun, Moon, ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RedHeader({ setIsDark, isDark }) {
  const [visibleModal, setVisibleModal] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const width = useWindowWidth();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const userName = user?.user_metadata?.full_name;
  const courses = useCourseStore((state) => state.courses);
  const fetchAllCourses = useCourseStore((state) => state.fetchAllCourses);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-[1100px] text-darkerBlack flex flex-col px-6 justify-center z-50">
      <div className="bg-slate-950/35 border dark:bg-slate-600/50 border-slate-500/25 backdrop-blur-md w-full py-[9px] px-3 rounded-[12px] flex justify-between items-center shadow-lg">
        <img
          src={width > 850 ? DesktopLogo : MobileDesktop}
          className="w-36 cursor-pointer"
          onClick={() => navigate("/")}
          title="Logo platformy"
          alt="Logo platformy"
        />

        <div>
          {width > 850 ? (
            <ul className="flex gap-8 items-center text-white">
              <li
                onClick={() => {
                  setIsDark((prev) => {
                    const newValue = !prev;
                    localStorage.setItem("theme", newValue ? "dark" : "light");
                    return newValue;
                  });
                }}
                className="cursor-pointer p-2 hover:text-gray-300 transition-all"
                title="Przełącz tryb jasny/ciemny"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </li>

              <li className="cursor-pointer hover:text-gray-300">O nas</li>
              <li className="cursor-pointer hover:text-gray-300">Osiągnięcia</li>

              <li
                className="relative group cursor-pointer"
                onMouseEnter={() => setCourseDropdownOpen(true)}
                onMouseLeave={() => setCourseDropdownOpen(false)}
              >
                <span className="flex items-center gap-1 p-2 hover:text-gray-300 transition-all">
                  Kursy <ChevronDown size={16} />
                </span>
                <AnimatePresence>
                  {courseDropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-4 py-2 w-48 bg-slate-950/50 border dark:bg-slate-600/50 border-slate-500/25 backdrop-blur-md text-white shadow-lg rounded-lg overflow-hidden z-50"
                    >
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <li
                            key={course.id}
                            onClick={() => navigate(`/kurs/${course.id}`)}
                            className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                          >
                            {course.title}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-sm text-gray-400">
                          Brak kursów
                        </li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>

              <li className="cursor-pointer hover:text-gray-300">Opinie</li>
              <li
                onClick={() => navigate("/blog")}
                className="cursor-pointer hover:text-gray-300"
              >
                Blog
              </li>
              <li
                onClick={() => navigate("/zasoby")}
                className="cursor-pointer hover:text-gray-300"
              >
                Arkusze
              </li>

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
                  onClick={() => navigate("/authentication")}
                >
                  Zaloguj się
                </li>
              )}
            </ul>
          ) : (
            <span className="flex items-center gap-2">
              <span
                onClick={() => setIsDark(!isDark)}
                className="cursor-pointer p-2 text-white hover:text-gray-400 transition-all"
                title="Przełącz tryb jasny/ciemny"
              >
                {isDark ? <Sun size={26} /> : <Moon size={26} />}
              </span>

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

                <li
                  onClick={() => setCourseDropdownOpen((prev) => !prev)}
                  className="cursor-pointer hover:text-gray-300 flex items-center gap-1"
                >
                  Kursy <ChevronDown size={16} />
                </li>

                {courseDropdownOpen && (
                  <ul className="pl-4 flex flex-col gap-2 text-sm">
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <li
                          key={course.id}
                          onClick={() => {
                            setVisibleModal(false);
                            setCourseDropdownOpen(false);
                            navigate(`/kurs/${course.id}`);
                          }}
                          className="cursor-pointer hover:text-gray-400"
                        >
                          {course.title}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400">Brak kursów</li>
                    )}
                  </ul>
                )}

                <li className="cursor-pointer hover:text-gray-300">Opinie</li>
                <li
                  onClick={() => navigate("/blog")}
                  className="cursor-pointer hover:text-gray-300"
                >
                  Blog
                </li>
                <li
                  onClick={() => navigate("/zasoby")}
                  className="cursor-pointer hover:text-gray-300"
                >
                  Arkusze
                </li>
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
                    onClick={() => navigate("/authentication")}
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
