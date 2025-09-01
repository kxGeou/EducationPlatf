// Start 20:30

import LogoLight from "../../assets/logoDesk.png";
import LogoMobile from "../../assets/logoMobile.svg";
import LogoDark from "../../assets/logo_biale.svg";
import { useAuthStore } from "../../store/authStore";
import Avatar from "boring-avatars";
import {
  BookOpenText,
  BookText,
  MessageSquareWarningIcon,
  Moon,
  ShoppingCart,
  SidebarClose,
  Sun,
} from "lucide-react";
import React, { useState } from "react";

function Navigation({
  activePage,
  setActivePage,
  userDataModal,
  setUserDataModal,
  isDark,
  setIsDark,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const user = useAuthStore((state) => state.user);

  return (
    <nav
      className={`${
        isOpen ? "w-1/6" : "w-[4rem]"
      } bg-white dark:bg-DarkblackBorder text-blackText dark:text-white shadow-md p-4 rounded-[12px] min-h-[98vh] max-h-[98vh] sticky top-2 transition-all duration-300`}
    >
      {/* OTWARTE */}
      {isOpen && (
        <div className="flex flex-col w-full  h-full  justify-between transition-all duration-200">
          <div>
            <div className="flex justify-between items-center w-full">
              <img src={isDark ? LogoDark : LogoLight} alt="Vector logo" className="w-30" />
              <SidebarClose
                size={20}
                className="hover:text-primaryBlue transition-all duration-200 cursor-pointer dark:hover:text-primaryGreen"
                onClick={() => setIsOpen(!isOpen)}
              ></SidebarClose>
            </div>
            <hr className="w-full h-[1px] bg-slate-400 opacity-20 my-4" />

            <div className="flex flex-col gap-5 w-full">
              <span
                onClick={() => setActivePage("courses")}
                className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                  activePage == "courses" &&
                  "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                }`}
              >
                <ShoppingCart size={20}></ShoppingCart>
                Twoje kursy
              </span>
              <span
                className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                  activePage == "resources" &&
                  "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                }`}
                onClick={() => setActivePage("resources")}
              >
                <BookOpenText size={20}></BookOpenText>
                Zasoby
              </span>
              <span
                onClick={() => setActivePage("reports")}
                className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                  activePage == "reports" &&
                  "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                }`}
              >
                <MessageSquareWarningIcon size={20}></MessageSquareWarningIcon>
                Zgłoszenia
              </span>
              <span
                onClick={() => setActivePage("blogs")}
                className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                  activePage == "blogs" &&
                  "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
                }`}
              >
                <BookText size={20}></BookText>
                Blogi
              </span>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-4">
              <div
                className="flex gap-4 items-center cursor-pointer"
                onClick={() => setUserDataModal(!userDataModal)}
                aria-label="Otwórz dane użytkownika"
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
                <span className="opacity-85">
                  {user?.user_metadata?.full_name || "Użytkownik"}
                </span>
              </div>
              <span
                onClick={() => {
                  setIsDark((prev) => {
                    const newValue = !prev;
                    localStorage.setItem("theme", newValue ? "dark" : "light");
                    return newValue;
                  });
                }}
                className="cursor-pointer  py-3 items-center justify-center transition-discrete bg-gray-200 dark:bg-DarkblackText rounded-[8px] flex w-full"
                title="Przełącz tryb jasny/ciemny"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}   
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ZAMKNIĘTE */}
      {!isOpen && (
        <div className="flex flex-col w-full  h-full  justify-between transition-all duration-200">
          <div>
            <div className="flex flex-col items-center gap-4 w-full">
              <img src={LogoMobile} alt="Vector logo" className="w-12 min-w-8" />
              <SidebarClose
                size={22}
                className="hover:text-primaryBlue transition-all duration-200 cursor-pointer dark:hover:text-primaryGreen"
                onClick={() => setIsOpen(!isOpen)}
              ></SidebarClose>
            </div>
            <hr className="w-full h-[1px] bg-slate-400 dark:bg-slate-200 opacity-20 dark:opacity-40 my-4" />

            <div className="flex flex-col gap-5 items-center w-full">
              <span
                onClick={() => setActivePage("courses")}
                className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                  activePage == "courses" &&
                  " text-secondaryBlue  dark:text-primaryGreen"
                }`}
              >
                <ShoppingCart size={22}></ShoppingCart>
              </span>
              <span
                className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                  activePage == "resources" &&
                  " text-secondaryBlue  dark:text-primaryGreen"
                }`}
                onClick={() => setActivePage("resources")}
              >
                <BookOpenText size={22}></BookOpenText>
              </span>
              <span
                onClick={() => setActivePage("reports")}
                className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                  activePage == "reports" &&
                  " text-secondaryBlue  dark:text-primaryGreen"
                }`}
              >
                <MessageSquareWarningIcon size={22}></MessageSquareWarningIcon>
              </span>
              <span
                onClick={() => setActivePage("blogs")}
                className={`cursor-pointer flex items-center gap-2 transition-discrete duration-200 ${
                  activePage == "blogs" &&
                  " text-secondaryBlue  dark:text-primaryGreen"
                }`}
              >
                <BookText size={22}></BookText>
              </span>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-4">
              <div
                className="flex gap-4 items-center cursor-pointer"
                onClick={() => setUserDataModal(!userDataModal)}
                aria-label="Otwórz dane użytkownika"
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
              </div>
              <span
                onClick={() => {
                  setIsDark((prev) => {
                    const newValue = !prev;
                    localStorage.setItem("theme", newValue ? "dark" : "light");
                    return newValue;
                  });
                }}
                className="cursor-pointer  py-3 items-center justify-center transition-discrete rounded-[8px] flex w-full"
                title="Przełącz tryb jasny/ciemny"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}   
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
