import DesktopLogo from "../../assets/logoDesk.png";
import MobileDesktop from "../../assets/logoMobile.svg";
import LogoWhite from "../../assets/logo_biale.svg";
import useWindowWidth from "../../hooks/useWindowWidth";
import { useAuthStore } from "../../store/authStore";
import Avatar from "boring-avatars";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserHeader({
  userDataModal,
  setUserDataModal,
  activePage,
  setActivePage,
  isDark,
  setIsDark,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const width = useWindowWidth();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { direct: "/firstBlog", title: "Jak radzić sobie ze stresem" },
    { direct: "/secondBlog", title: "Zarządzanie emocjami w pracy" },
    { direct: "/thirdBlog", title: "Techniki relaksacyjne na co dzień" },
  ];

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="px-4"
    >
      <header
        className={`z-40 bg-white text-blackText  rounded-[12px] rounded-t-[0px] border-b border-gray-300 w-full flex justify-center py-2 px-4 lg:px-6 transition-all dark:bg-DarkblackText dark:border-transparent dark:text-white ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        {width >= 750 ? (
          <div className="w-full max-w-[1600px] flex justify-between items-center px-6 lg:px-0">
            <div className="flex items-center gap-6">
              {isDark ? (
                <img
                  src={width > 600 ? LogoWhite : MobileDesktop}
                  aria-label="Przejdź do strony głównej"
                  onClick={() => navigate("/")}
                  className={`font-semibold  cursor-pointer ${
                    width > 600 ? "w-36" : "w-12"
                  }`}
                ></img>
              ) : (
                <img
                  src={width > 600 ? DesktopLogo : MobileDesktop}
                  aria-label="Przejdź do strony głównej"
                  onClick={() => navigate("/")}
                  className={`font-semibold  cursor-pointer ${
                    width > 600 ? "w-36" : "w-12"
                  }`}
                ></img>
              )}

              <nav>
                <ul className="flex items-center gap-4">
                  <li
                    onClick={() => setActivePage("courses")}
                  className="cursor-pointer"

                  >
                    Twoje kursy
                  </li>
                  <li 
                  className="cursor-pointer"
                    onClick={() => setActivePage("resources")}
                  >
                    Zasoby
                  </li>
                  <li
                    onClick={() => setActivePage("reports")}
                  className="cursor-pointer"

                  >
                    Zgłoszenia
                  </li>
                  <li
                    onClick={() => {
                      setIsDark((prev) => {
                        const newValue = !prev;
                        localStorage.setItem(
                          "theme",
                          newValue ? "dark" : "light"
                        );
                        return newValue;
                      });
                    }}
                    className="cursor-pointer p-2 hover:text-gray-300 transition-all"
                    title="Przełącz tryb jasny/ciemny"
                  >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </li>
                </ul>
              </nav>
            </div>

            <div
              onClick={() => setUserDataModal(!userDataModal)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Otwórz dane użytkownika"
            >
              <div className="flex gap-2 items-center">
                <span className="opacity-75">
                  {user?.user_metadata?.full_name || "Użytkownik"}
                </span>
                <Avatar
                  name={user?.user_metadata?.full_name || "Użytkownik"}
                  colors={[
                    "#0056d6",
                    "#669c35",
                    "#ffffff",
                    "#74a7fe",
                    "#cce8b5",
                  ]}
                  variant="beam"
                  size={30}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[1600px] flex justify-between items-center relative">
            <img
              src={width > 600 ? DesktopLogo : MobileDesktop}
              aria-label="Przejdź do strony głównej"
              onClick={() => navigate("/")}
              className={`font-semibold  cursor-pointer ${
                width > 600 ? "w-36" : "w-12"
              }`}
            ></img>

            <div className="flex items-center gap-2">
              <div
                onClick={() => {
                  setIsDark((prev) => {
                    const newValue = !prev;
                    localStorage.setItem("theme", newValue ? "dark" : "light");
                    return newValue;
                  });
                }}
                className="cursor-pointer p-2 hover:text-gray-300
                transition-all"
                title="Przełącz tryb jasny/ciemny"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <div
                className="text-darkerBlack cursor-pointer p-2 rounded-lg dark:hover:bg-DarkblackBorder hover:bg-gray-100 transition"
                role="button"
                tabIndex={0}
                aria-label="Przełącz menu mobilne"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? (
                  <X size={26} className="dark:text-white" />
                ) : (
                  <Menu size={26} className="dark:text-white" />
                )}
              </div>
            </div>






            



            {/* MOBILKA  */}

            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    userDataModal && "hidden"
                  } absolute top-12 w-full -right-4 mt-3 px-5 py-6 rounded-[12px] shadow-xl bg-white dark:bg-DarkblackBorder z-50 space-y-6`}
                >
                  <div
                    onClick={() => setUserDataModal(!userDataModal)}
                    className="cursor-pointer"
                  >
                    <h3 className="text-xs font-semibold text-gray-400 mb-2">
                      PROFIL
                    </h3>
                    <div className="flex gap-3 items-center">
                      <Avatar
                        name={user?.user_metadata?.full_name || "Użytkownik"}
                        colors={[
                          "#0056d6",
                          "#669c35",
                          "#ffffff",
                          "#74a7fe",
                          "#cce8b5",
                        ]}
                        variant="beam"
                        size={36}
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {user?.user_metadata?.full_name || "Użytkownik"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 mb-2">
                      NAWIGACJA
                    </h3>
                    <ul className="flex flex-col gap-3">
                      <li
                     
                        onClick={() => {
                          setActivePage("courses")
                          setMobileOpen(false);
                        }}
                      >
                        📚 Twoje kursy
                      </li>
                      <li
                       onClick={() => {
                          setActivePage("resources")
                          setMobileOpen(false);
                        }}
                      >
                        🎧 Zasoby
                      </li>
                      <li
                       onClick={() => {
                          setActivePage("reports")
                          setMobileOpen(false);
                        }}
                      >
                        📢 Zgłoszenia
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                      MATERIAŁY <ChevronDown size={14} />
                    </h3>
                    <ul className="flex flex-col gap-3">
                      {navItems.map((item, index) => (
                        <li key={index}>
                          <button
                            onClick={() => {
                              navigate(item.direct);
                              setMobileOpen(false);
                            }}
                            className="w-full text-left text-sm font-medium hover:text-primaryBlue transition"
                          >
                            {item.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>
    </motion.div>
  );
}

export default UserHeader;
