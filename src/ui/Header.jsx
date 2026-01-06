import MobileDesktop from "../assets/logoMobile.svg";
import DesktopLogo from "../assets/logo_biale.svg";
import useWindowWidth from "../hooks/useWindowWidth";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
// DEV: Calendar import - odkomentuj na development, zakomentuj na main
import { Menu, User, X, Sun, Moon, ChevronDown } from "lucide-react";
// import { Menu, User, X, Sun, Moon, ChevronDown, Calendar } from "lucide-react";
// DEV: END Calendar import
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Header({ setIsDark, isDark }) {
  const [visibleModal, setVisibleModal] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const width = useWindowWidth();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const userName = user?.user_metadata?.full_name;

  // Check if current path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const courses = [
    { id: "42096b48-f979-46a2-8785-eb9ade8d5614", title: "Matura z Informatyki" },
    { id: "ddcfaafe-b6f3-4f82-8a87-5a344033a525", title: "Egzamin INF.02" },
    { id: "fa2b94ff-6dea-48a1-a26e-d4ce9c75b7ed", title: "Egzamin INF.03" },
  ];

  return (
    <motion.header 
      className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-[1100px] text-darkerBlack flex flex-col px-4 justify-center z-50"
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <div className="bg-slate-950/35 border dark:bg-slate-600/50 border-slate-500/25 backdrop-blur-md w-full py-2.5 px-4 rounded-2xl flex justify-between items-center shadow-lg">
        <Link to="/" aria-label="Strona główna – Platforma edukacyjna Informatyka">
          <img
            src={width > 850 ? DesktopLogo : MobileDesktop}
            className={`w-10 ${width > 850 && "w-36 "}cursor-pointer`}
            title="Platforma edukacyjna – kursy i egzaminy z informatyki"
            alt="Logo Platforma Edukacyjna – kursy do matury i egzaminów z informatyki"

            loading="eager"
          />
        </Link>

        <nav>
          {width > 850 ? (
            <ul className="flex gap-4 items-center text-white">
              {/* Dark Mode Toggle */}
              <li
                className="cursor-pointer p-1.5 rounded-xl hover:bg-white/10 transition-all duration-200"
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
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </li>

              {/* DEV: Kursy Dropdown - odkomentuj na development, zakomentuj na main */}
              {/* <li
                className="relative group cursor-pointer"
                onMouseEnter={() => setCourseDropdownOpen(true)}
                onMouseLeave={() => setCourseDropdownOpen(false)}
              >
                <span className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm ${
                  isActive('/kurs') 
                    ? 'bg-white/15 text-white font-medium' 
                    : 'hover:bg-white/10 hover:text-gray-200'
                }`}>
                  Kursy 
                  <ChevronDown 
                    size={12} 
                    className={`transition-transform duration-200 ${courseDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </span>
                <AnimatePresence>
                  {courseDropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute flex flex-col left-0 mt-5 py-2 w-56 bg-slate-600/85 border border-slate-400/50 backdrop-blur-xl text-white shadow-2xl rounded-lg overflow-hidden z-50"
                    >
                      {courses.length > 0 ? (
                        courses.map((course, index) => (
                          <motion.li
                            key={course.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={`/kurs/${course.id}`}
                              className="block px-3 py-2 hover:bg-white/15 transition-colors duration-150 text-sm"
                            >
                              {course.title}
                            </Link>
                          </motion.li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-sm text-gray-400">Brak kursów</li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li> */}
              {/* DEV: END Kursy Dropdown */}

              {/* Navigation Links */}
              <li>
                <Link 
                  to="/ebooks" 
                  className={`px-2.5 py-1.5 rounded-xl transition-all duration-200 text-sm ${
                    isActive('/ebooks')
                      ? 'bg-white/15 text-white font-medium'
                      : 'hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  Ebooki
                </Link>
              </li>
              <li>
                <Link 
                  to="/exam" 
                  className={`px-2.5 py-1.5 rounded-xl transition-all duration-200 text-sm ${
                    isActive('/exam')
                      ? 'bg-white/15 text-white font-medium'
                      : 'hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  Egzaminy
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`px-2.5 py-1.5 rounded-xl transition-all duration-200 text-sm ${
                    isActive('/contact')
                      ? 'bg-white/15 text-white font-medium'
                      : 'hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  Kontakt
                </Link>
              </li>
              {/* DEV: Blog link - odkomentuj na development, zakomentuj na main */}
              {/* <li>
                <Link 
                  to="/blog" 
                  className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/blog')
                      ? 'bg-white/15 text-white font-medium'
                      : 'hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  Blog
                </Link>
              </li> */}
              {/* DEV: END Blog link */}
              {/* DEV: TestResources link - odkomentuj na development, zakomentuj na main */}
              <li>
                <Link 
                  to="/zasoby" 
                  className={`px-2.5 py-1.5 rounded-xl transition-all duration-200 text-sm ${
                    isActive('/zasoby')
                      ? 'bg-white/15 text-white font-medium'
                      : 'hover:bg-white/10 hover:text-gray-200'
                  }`}
                >
                  Arkusze
                </Link>
              </li>
              {/* DEV: END TestResources link */}

              {/* DEV: Calendar Button - odkomentuj na development, zakomentuj na main */}
              {/* <li>
                <Link
                  to="/calendar"
                  className={`flex items-center gap-1.5 bg-gradient-to-r from-primaryBlue to-secondaryBlue px-3 py-1.5 rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 text-sm ${
                    isActive('/calendar') ? 'ring-2 ring-white/30' : ''
                  }`}
                >
                  <Calendar size={16} aria-hidden="true" />
                  <span className="font-medium">Kalendarz</span>
                </Link>
              </li> */}
              {/* DEV: END Calendar Button */}

              {/* User Button */}
              {userName ? (
                <li>
                  <Link
                    to="/user_page"
                    className="flex items-center gap-1.5 bg-gradient-to-r to-primaryGreen from-secondaryGreen px-3 py-1.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 text-sm font-medium"
                  >
                    <span>Moje kursy</span>
                    <User size={16} aria-hidden="true" />
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    to="/authentication"
                    className="bg-gradient-to-r to-primaryGreen from-secondaryGreen px-4 py-1.5 rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 text-sm font-medium"
                  >
                    Zaloguj się
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
            <nav className="bg-slate-950/35 border border-slate-500/25 backdrop-blur-lg rounded-2xl px-6 py-4 text-white shadow-lg">
              <ul className="flex flex-col gap-2 items-stretch text-white">
                {/* DEV: Kursy Dropdown (mobile) - odkomentuj na development, zakomentuj na main */}
                {/* <li>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setCourseDropdownOpen((prev) => !prev)}
                  >
                    <span className="font-medium">Kursy</span>
                    <ChevronDown 
                      size={16} 
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${courseDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {courseDropdownOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 flex flex-col gap-1.5 text-sm bg-slate-950/30 w-full py-3 rounded-lg mt-1">
                          {courses.length > 0 ? (
                            courses.map((course) => (
                              <li key={course.id}>
                                <Link
                                  to={`/kurs/${course.id}`}
                                  className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors duration-150"
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
                            <li className="px-3 py-2 text-gray-400">Brak kursów</li>
                          )}
                        </div>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li> */}
                {/* DEV: END Kursy Dropdown (mobile) */}

                {/* Navigation Links */}
                <li>
                  <Link 
                    to="/ebooks" 
                    className={`block px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                      isActive('/ebooks')
                        ? 'bg-white/15 font-medium'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => setVisibleModal(false)}
                  >
                    Ebooki
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/exam" 
                    className={`block px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                      isActive('/exam')
                        ? 'bg-white/15 font-medium'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => setVisibleModal(false)}
                  >
                    Egzaminy
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className={`block px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                      isActive('/contact')
                        ? 'bg-white/15 font-medium'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => setVisibleModal(false)}
                  >
                    Kontakt
                  </Link>
                </li>
                {/* DEV: Blog link (mobile) - odkomentuj na development, zakomentuj na main */}
                {/* <li>
                  <Link 
                    to="/blog" 
                    className={`block px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                      isActive('/blog')
                        ? 'bg-white/15 font-medium'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => setVisibleModal(false)}
                  >
                    Blog
                  </Link>
                </li> */}
                {/* DEV: END Blog link (mobile) */}
                {/* DEV: TestResources link (mobile) - odkomentuj na development, zakomentuj na main */}
                <li>
                  <Link 
                    to="/zasoby" 
                    className={`block px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                      isActive('/zasoby')
                        ? 'bg-white/15 font-medium'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => setVisibleModal(false)}
                  >
                    Arkusze
                  </Link>
                </li>
                {/* DEV: END TestResources link (mobile) */}

                {/* DEV: Calendar Button (mobile) - odkomentuj na development, zakomentuj na main */}
                {/* <li className="pt-1">
                  <Link
                    to="/calendar"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primaryBlue to-secondaryBlue px-4 py-2.5 rounded-md transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    onClick={() => setVisibleModal(false)}
                  >
                    <Calendar size={18} aria-hidden="true" />
                    Kalendarz
                  </Link>
                </li> */}
                {/* DEV: END Calendar Button (mobile) */}

                {/* User Button */}
                {userName ? (
                  <li>
                    <Link
                      to="/user_page"
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r to-primaryGreen from-secondaryGreen px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                      onClick={() => setVisibleModal(false)}
                    >
                      <span>Moje kursy</span>
                      <User size={18} aria-hidden="true" />
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      to="/authentication"
                      className="flex items-center justify-center w-full bg-gradient-to-r to-primaryGreen from-secondaryGreen px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                      onClick={() => setVisibleModal(false)}
                    >
                      Zaloguj się
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
