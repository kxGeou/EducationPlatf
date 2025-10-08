import { Link } from "react-router-dom";
import LogoLight from '../../../assets/logoDesk.png';
import LogoMobile from '../../../assets/logoMobile.svg';
import LogoDark from '../../../assets/logo_biale.svg';
import { useAuthStore } from '../../../store/authStore';
import { usePollStore } from '../../../store/formStore';
import Avatar from "boring-avatars";
import {
  BookOpenText,
  BookText,
  MessageSquareWarningIcon,
  Moon,
  ShoppingCart,
  SidebarClose,
  Sun,
  Menu,
  ListCheck,
  PenBoxIcon,
  Trophy,
  Star,
  LayoutDashboard,
} from "lucide-react";
import React, { useState, useEffect } from "react";

function Navigation({
  activePage,
  setActivePage,
  isDark,
  setIsDark,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const userPoints = useAuthStore((state) => state.userPoints);

  const polls = usePollStore((s) => s.polls);
  const fetchPolls = usePollStore((s) => s.fetchPolls);
  const [votedPolls, setVotedPolls] = useState(() => {
    const stored = localStorage.getItem("votedPolls");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const hasUnvotedPolls = polls.some((poll) => !votedPolls.includes(poll.id));

  return (
    <>
      <nav
        className={`hidden md:block ${
          isOpen ? "w-1/6" : "w-[4rem]"
        } bg-white dark:bg-DarkblackBorder text-blackText dark:text-white shadow-md p-4 rounded-[12px] min-h-[98vh] max-h-[98vh] sticky top-2 transition-all duration-300`}
      >
        {isOpen && (
          <div className="flex flex-col w-full h-full justify-between transition-all duration-200">
            <div>
              <div className="flex justify-between items-center w-full">
                <Link to={"/"}>
                  <img
                    src={isDark ? LogoDark : LogoLight}
                    alt="Vector logo"
                    className="w-30"
                  />
                </Link>

                <SidebarClose
                  size={20}
                  className="hover:text-primaryBlue transition-all duration-200 cursor-pointer dark:hover:text-primaryGreen"
                  onClick={() => setIsOpen(!isOpen)}
                />
              </div>
              <hr className="w-full h-[1px] bg-slate-400 opacity-20 my-4" />

              <div className="flex flex-col gap-5 w-full">
                <span
                  onClick={() => setActivePage("dashboard")}
                  className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                    activePage === "dashboard" &&
                    "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                  }`}
                >
                  <LayoutDashboard size={20} />
                  Statystyki
                </span>
                <span
                  onClick={() => setActivePage("courses")}
                  className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                    activePage === "courses" &&
                    "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                  }`}
                >
                  <ShoppingCart size={20} />
                  Twoje kursy
                </span>
                <span
                  onClick={() => setActivePage("resources")}
                  className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                    activePage === "resources" &&
                    "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                  }`}
                >
                  <BookOpenText size={20} />
                  Zasoby
                </span>
                <span
                  onClick={() => setActivePage("reports")}
                  className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                    activePage === "reports" &&
                    "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                  }`}
                >
                  <MessageSquareWarningIcon size={20} />
                  Zgłoszenia
                </span>
                <span
                  onClick={() => setActivePage("blogs")}
                  className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                    activePage === "blogs" &&
                    "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                  }`}
                >
                  <BookText size={20} />
                  Blogi
                </span>
                <span
                  onClick={() => setActivePage("forms")}
                  className={`relative cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                    activePage === "forms" &&
                    "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                  }`}
                >
                  <ListCheck size={20} />
                  Ankiety
                  {hasUnvotedPolls && (
                    <>
                      <span className="absolute right-[50%] top-0 w-2 h-2 rounded-full bg-primaryGreen animate-ping"></span>
                      <span className="absolute right-[50%] top-0 w-2 h-2 rounded-full bg-primaryGreen"></span>
                    </>
                  )}
                </span>
                <span
                  onClick={() => setActivePage("ideas")}
                  className={`relative cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                    activePage === "ideas" &&
                    "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                  }`}
                >
                  <PenBoxIcon size={20} />
                  Pomysły
                </span>
                <span
                  onClick={() => setActivePage("leaderboard")}
                  className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                    activePage === "leaderboard" &&
                    "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                  }`}
                >
                  <Trophy size={20} />
                  Ranking
                </span>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-4">
                <div
                  className="flex gap-4 items-center cursor-pointer"
                  onClick={() => setActivePage("profile")}
                  aria-label="Otwórz profil użytkownika"
                  role="button"
                >
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
                  <div className="flex flex-col items-start">
                    <span className="opacity-85 text-sm">
                      {user?.user_metadata?.full_name || "Użytkownik"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" />
                      {userPoints || 0} pkt
                    </span>
                  </div>
                </div>
                <span
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
                  className="cursor-pointer py-3 items-center justify-center transition-discrete bg-gray-200 dark:bg-DarkblackText rounded-[8px] flex w-full"
                  title="Przełącz tryb jasny/ciemny"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </span>
              </div>
            </div>
          </div>
        )}

        {!isOpen && (
          <div className="flex flex-col w-full h-full justify-between transition-all duration-200">
            <div>
              <div className="flex flex-col items-center gap-4 w-full">
                <Link to={"/"}>
                  <img src={LogoMobile} alt="Vector logo" className="w-12" />
                </Link>
                <SidebarClose
                  size={22}
                  className="hover:text-primaryBlue transition-all duration-200 cursor-pointer dark:hover:text-primaryGreen"
                  onClick={() => setIsOpen(!isOpen)}
                />
              </div>
              <hr className="w-full h-[1px] bg-slate-400 dark:bg-slate-200 opacity-20 dark:opacity-40 my-4" />

              <div className="flex flex-col gap-5 items-center w-full">
                <span
                  onClick={() => setActivePage("dashboard")}
                  className={`cursor-pointer ${
                    activePage === "dashboard" &&
                    "text-secondaryBlue dark:text-primaryGreen"
                  }`}
                >
                  <LayoutDashboard size={22} />
                </span>
                <span
                  onClick={() => setActivePage("courses")}
                  className={`cursor-pointer ${
                    activePage === "courses" &&
                    "text-secondaryBlue dark:text-primaryGreen"
                  }`}
                >
                  <ShoppingCart size={22} />
                </span>
                <span
                  onClick={() => setActivePage("resources")}
                  className={`cursor-pointer ${
                    activePage === "resources" &&
                    "text-secondaryBlue dark:text-primaryGreen"
                  }`}
                >
                  <BookOpenText size={22} />
                </span>
                <span
                  onClick={() => setActivePage("reports")}
                  className={`cursor-pointer ${
                    activePage === "reports" &&
                    "text-secondaryBlue dark:text-primaryGreen"
                  }`}
                >
                  <MessageSquareWarningIcon size={22} />
                </span>
                <span
                  onClick={() => setActivePage("blogs")}
                  className={`cursor-pointer ${
                    activePage === "blogs" &&
                    "text-secondaryBlue dark:text-primaryGreen"
                  }`}
                >
                  <BookText size={22} />
                </span>
                <span
                  onClick={() => setActivePage("forms")}
                  className={`relative cursor-pointer ${
                    activePage === "forms" &&
                    "text-secondaryBlue dark:text-primaryGreen"
                  }`}
                >
                  <ListCheck size={22} />
                  {hasUnvotedPolls && (
                    <>
                      <span className="absolute left-[78%] top-0 w-2 h-2 rounded-full bg-primaryGreen animate-ping"></span>
                      <span className="absolute left-[78%] top-0 w-2 h-2 rounded-full bg-primaryGreen"></span>
                    </>
                  )}
                </span>
                <span
                  onClick={() => setActivePage("ideas")}
                  className={`relative cursor-pointer ${
                    activePage === "ideas" &&
                    "text-secondaryBlue dark:text-primaryGreen"
                  }`}
                >
                  <PenBoxIcon size={22} />
                </span>
                <span
                  onClick={() => setActivePage("leaderboard")}
                  className={`cursor-pointer ${
                    activePage === "leaderboard" &&
                    "text-secondaryBlue dark:text-primaryGreen"
                  }`}
                >
                  <Trophy size={22} />
                </span>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-4">
                <div
                  className="flex gap-4 items-center cursor-pointer"
                  onClick={() => setActivePage("profile")}
                  aria-label="Otwórz profil użytkownika"
                  role="button"
                >
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
                  <div className="flex flex-col items-start">
                    <span className="opacity-85 text-sm">
                      {user?.user_metadata?.full_name || "Użytkownik"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" />
                      {userPoints || 0} pkt
                    </span>
                  </div>
                </div>
                <span
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
                  className="cursor-pointer py-3 items-center justify-center transition-discrete rounded-[8px] flex w-full"
                  title="Przełącz tryb jasny/ciemny"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="flex md:hidden w-full items-center justify-between bg-white dark:bg-DarkblackBorder text-blackText dark:text-white p-4 shadow-md fixed top-0 left-0 z-50">
        <Link to={"/"}>
          <img src={isDark ? LogoDark : LogoMobile} alt="Logo" className="h-8" />
        </Link>
        <Menu
          size={28}
          className="cursor-pointer"
          onClick={() => setMobileOpen(true)}
        />
      </div>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute top-0 left-0 h-full w-64 bg-white dark:bg-DarkblackBorder text-blackText dark:text-white shadow-lg transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
            <Link to={"/"}>
              <img src={isDark ? LogoDark : LogoLight} alt="Logo" className="h-8" />
            </Link>
            <SidebarClose
              size={24}
              className="cursor-pointer"
              onClick={() => setMobileOpen(false)}
            />
          </div>

          <div className="flex flex-col gap-5 p-4">
            <span
              onClick={() => {
                setActivePage("dashboard");
                setMobileOpen(false);
              }}
              className={`cursor-pointer flex items-center gap-2 ${
                activePage === "dashboard" &&
                "text-secondaryBlue dark:text-primaryGreen"
              }`}
            >
              <LayoutDashboard size={20} /> Statystyki
            </span>
            <span
              onClick={() => {
                setActivePage("courses");
                setMobileOpen(false);
              }}
              className={`cursor-pointer flex items-center gap-2 ${
                activePage === "courses" &&
                "text-secondaryBlue dark:text-primaryGreen"
              }`}
            >
              <ShoppingCart size={20} /> Twoje kursy
            </span>
            <span
              onClick={() => {
                setActivePage("resources");
                setMobileOpen(false);
              }}
              className={`cursor-pointer flex items-center gap-2 ${
                activePage === "resources" &&
                "text-secondaryBlue dark:text-primaryGreen"
              }`}
            >
              <BookOpenText size={20} /> Zasoby
            </span>
            <span
              onClick={() => {
                setActivePage("reports");
                setMobileOpen(false);
              }}
              className={`cursor-pointer flex items-center gap-2 ${
                activePage === "reports" &&
                "text-secondaryBlue dark:text-primaryGreen"
              }`}
            >
              <MessageSquareWarningIcon size={20} /> Zgłoszenia
            </span>
            <span
              onClick={() => {
                setActivePage("blogs");
                setMobileOpen(false);
              }}
              className={`cursor-pointer flex items-center gap-2 ${
                activePage === "blogs" &&
                "text-secondaryBlue dark:text-primaryGreen"
              }`}
            >
              <BookText size={20} /> Blogi
            </span>
            <span
              onClick={() => {
                setActivePage("forms");
                setMobileOpen(false);
              }}
              className={`relative cursor-pointer flex items-center gap-2 ${
                activePage === "forms" &&
                "text-secondaryBlue dark:text-primaryGreen"
              }`}
            >
              <ListCheck size={20} /> Ankiety
              {hasUnvotedPolls && (
                <>
                  <span className="absolute left-[37%] top-0 w-2 h-2 rounded-full bg-primaryGreen animate-ping"></span>
                  <span className="absolute left-[37%] top-0 w-2 h-2 rounded-full bg-primaryGreen"></span>
                </>
              )}
            </span>
            <span
              onClick={() => {
                setActivePage("ideas");
                setMobileOpen(false);
              }}
              className={`relative cursor-pointer flex items-center gap-2 ${
                activePage === "ideas" &&
                "text-secondaryBlue dark:text-primaryGreen"
              }`}
            >
              <PenBoxIcon size={20} /> Pomysły
            </span>
            <span
              onClick={() => {
                setActivePage("leaderboard");
                setMobileOpen(false);
              }}
              className={`cursor-pointer flex items-center gap-2 ${
                activePage === "leaderboard" &&
                "text-secondaryBlue dark:text-primaryGreen"
              }`}
            >
              <Trophy size={20} /> Ranking
            </span>
          </div>

          <div className="absolute bottom-4 left-0 w-full px-4 flex flex-col gap-4">
            <div
              className="flex gap-3 items-center cursor-pointer"
              onClick={() => {
                setActivePage("profile");
                setMobileOpen(false);
              }}
            >
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
              <div className="flex flex-col items-start">
                <span className="text-sm">
                  {user?.user_metadata?.full_name || "Użytkownik"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Star size={12} className="text-yellow-500" />
                  {userPoints || 0} pkt
                </span>
              </div>
            </div>

            <span
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
              className="cursor-pointer py-3 items-center justify-center bg-gray-200 dark:bg-DarkblackText rounded-[8px] flex w-full"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navigation;
