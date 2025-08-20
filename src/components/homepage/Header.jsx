import MobileDesktop from "../../assets/logoMobile.png";
import DesktopLogo from "../../assets/logo_biale.svg";
import useWindowWidth from "../../hooks/useWindowWidth";
import { useAuthStore } from "../../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, X, Sun, Moon, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header({ setIsDark, isDark }) {
  const [visibleModal, setVisibleModal] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const width = useWindowWidth();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const userName = user?.user_metadata?.full_name;

  const courses = [
    { id: "42096b48-f979-46a2-8785-eb9ade8d5614", title: "Matura z Informatyki" },
    { id: "ddcfaafe-b6f3-4f82-8a87-5a344033a525", title: "Egzamin INF.02" },
    { id: "fa2b94ff-6dea-48a1-a26e-d4ce9c75b7ed", title: "Egzamin INF.03" },
  ];

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-[1100px] text-darkerBlack flex flex-col px-4 justify-center z-50">
      <div className="bg-slate-950/35 border dark:bg-slate-600/50 border-slate-500/25 backdrop-blur-md w-full py-[9px] px-3 rounded-[12px] flex justify-between items-center shadow-lg">
        <Link to="/" aria-label="Strona główna – Platforma edukacyjna Informatyka">
          <img
            src={width > 850 ? DesktopLogo : MobileDesktop}
            className="w-36 cursor-pointer"
            title="Platforma edukacyjna – kursy i egzaminy z informatyki"
            alt="Logo Platforma Edukacyjna – kursy do matury i egzaminów z informatyki"
            width="144"
            height="40"
            loading="eager"
          />
        </Link>

        <nav>
          {width > 850 ? (
            <ul className="flex gap-8 items-center text-white">
              <li
                className="cursor-pointer p-2 hover:text-gray-300 transition-all"
                title="Przełącz tryb jasny/ciemny"
                role="button"
                aria-label="Przełącz tryb jasny/ciemny"
                onClick={() => {
                  setIsDark((prev) => {
                    const newValue = !prev;
                    localStorage.setItem("theme", newValue ? "dark" : "light");
                    return newValue;
                  });
                }}
              >
                {isDark ? <Sun size={20}  /> : <Moon size={20}  />}
              </li>

              <li
                className="relative group cursor-pointer"
                onMouseEnter={() => setCourseDropdownOpen(true)}
                onMouseLeave={() => setCourseDropdownOpen(false)}
              >
                <span className="flex items-center gap-1 p-2 hover:text-gray-300 transition-all">
                  Kursy <ChevronDown size={16}  />
                </span>
                <AnimatePresence>
                  {courseDropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute flex flex-col left-0 mt-4 py-2 w-56 bg-slate-700/75 border dark:bg-slate-500/75 border-slate-500/25 backdrop-blur-lg text-white shadow-lg rounded-lg overflow-hidden z-50"
                    >
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <Link
                            key={course.id}
                            to={`/kurs/${course.id}`}
                            className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                          >
                            {course.title}
                          </Link>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-sm text-gray-400">Brak kursów</li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>

              <li>
                <Link to="/contact" className="hover:text-gray-300">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-gray-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/zasoby" className="hover:text-gray-300">
                  Arkusze 
                </Link>
              </li>

              {userName ? (
                <li>
                  <Link
                    to="/user_page"
                    className="flex items-center gap-3 bg-gradient-to-r to-primaryGreen from-secondaryGreen px-4 py-[5px] rounded-[8px] hover:scale-[1.025]"
                  >
                    {userName}
                    <User size={18} aria-hidden="true" />
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    to="/authentication"
                    className="bg-gradient-to-r to-primaryGreen from-secondaryGreen px-5 py-[5px] rounded-[12px] cursor-pointer hover:scale-[1.025]"
                  >
                    Zaloguj się do platformy
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <span className="flex items-center gap-2">
              <span
                onClick={() => setIsDark(!isDark)}
                className="cursor-pointer p-2 text-white hover:text-gray-400 transition-all"
                title="Przełącz tryb jasny/ciemny"
                aria-label="Przełącz tryb jasny/ciemny"
                role="button"
              >
                {isDark ? <Sun size={26}  /> : <Moon size={26}  />}
              </span>

              {visibleModal ? (
                <X
                  onClick={() => setVisibleModal(false)}
                  size={30}
                  className="text-white cursor-pointer hover:text-gray-400"
                  aria-label="Zamknij menu"
                  role="button"
                />
              ) : (
                <Menu
                  size={30}
                  className="text-white cursor-pointer hover:text-gray-400"
                  onClick={() => setVisibleModal(true)}
                  aria-label="Otwórz menu"
                  role="button"
                />
              )}
            </span>
          )}
        </nav>
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
            <nav className="bg-slate-950/35 border border-slate-500/25 backdrop-blur-lg rounded-[12px] px-6 py-4 text-white shadow-lg">
              <ul className="flex flex-col gap-3 items-start text-white">
                <li
                  className="cursor-pointer hover:text-gray-300 flex items-center gap-1"
                  onClick={() => setCourseDropdownOpen((prev) => !prev)}
                >
                  Kursy <ChevronDown size={16} aria-hidden="true" />
                </li>

                {courseDropdownOpen && (
                  <ul className="pl-4 flex flex-col gap-2 text-sm bg-slate-950/20 w-full py-3 rounded-[12px]">
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <li key={course.id}>
                          <Link
                            to={`/kurs/${course.id}`}
                            className="cursor-pointer hover:text-gray-400 block"
                            onClick={() => {
                              setVisibleModal(false);
                              setCourseDropdownOpen(false);
                            }}
                          >
                            {course.title}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400">Brak kursów</li>
                    )}
                  </ul>
                )}
                <li>
                  <Link to="/contact" className="hover:text-gray-300" onClick={() => setVisibleModal(false)}>
                    Kontakt 
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-gray-300" onClick={() => setVisibleModal(false)}>
                    Blog 
                  </Link>
                </li>
                <li>
                  <Link to="/zasoby" className="hover:text-gray-300" onClick={() => setVisibleModal(false)}>
                    Arkusze
                  </Link>
                </li>
                {userName ? (
                  <li>
                    <Link
                      to="/user_page"
                      className="flex items-center gap-3 w-full bg-gradient-to-r to-primaryGreen from-secondaryGreen px-4 py-[5px] rounded-[8px] hover:scale-[1.025]"
                      onClick={() => setVisibleModal(false)}
                    >
                      {userName}
                      <User size={18} aria-hidden="true" />
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      to="/authentication"
                      className="bg-gradient-to-r w-full to-primaryGreen from-secondaryGreen px-5 py-[5px] rounded-[12px] cursor-pointer hover:scale-[1.025]"
                      onClick={() => setVisibleModal(false)}
                    >
                      Zaloguj się do platformy
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
