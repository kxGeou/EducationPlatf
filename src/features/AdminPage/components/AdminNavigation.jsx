import React from "react";
import { Trophy, Bell, BarChart3, PenBoxIcon, Video, Gift, Sun, Moon, CreditCard, Tag } from "lucide-react";

export default function AdminNavigation({ activeSection, setActiveSection, isDark, setIsDark }) {
  return (
    <nav className="hidden md:block fixed left-2 top-2 bottom-2 w-[240px] bg-white dark:bg-DarkblackBorder text-blackText dark:text-white shadow-md p-4 rounded-[12px] overflow-y-auto">
      <div className="flex flex-col w-full h-full justify-between">
        <div className="flex flex-col gap-5 w-full">
          <span
            onClick={() => setActiveSection("reports")}
            className={`cursor-pointer flex items-center gap-2 transition duration-200 ${
              activeSection === "reports" &&
              "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
            }`}
          >
            <Trophy size={20} />
            Zgłoszenia
          </span>
          <span
            onClick={() => setActiveSection("polls")}
            className={`cursor-pointer flex items-center gap-2 transition duration-200 ${
              activeSection === "polls" &&
              "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
            }`}
          >
            <BarChart3 size={20} />
            Ankiety
          </span>
          <span
            onClick={() => setActiveSection("ideas")}
            className={`cursor-pointer flex items-center gap-2 transition duration-200 ${
              activeSection === "ideas" &&
              "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
            }`}
          >
            <PenBoxIcon size={20} />
            Pomysły
          </span>
          <span
            onClick={() => setActiveSection("videoReviews")}
            className={`cursor-pointer flex items-center gap-2 transition duration-200 ${
              activeSection === "videoReviews" &&
              "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
            }`}
          >
            <Video size={20} />
            Recenzje wideo
          </span>
          <span
            onClick={() => setActiveSection("notifications")}
            className={`cursor-pointer flex items-center gap-2 transition duration-200 ${
              activeSection === "notifications" &&
              "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
            }`}
          >
            <Bell size={20} />
            Powiadomienia
          </span>
          <span
            onClick={() => setActiveSection("rewards")}
            className={`cursor-pointer flex items-center gap-2 transition duration-200 ${
              activeSection === "rewards" &&
              "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
            }`}
          >
            <Gift size={20} />
            Nagrody
          </span>
          <span
            onClick={() => setActiveSection("transactions")}
            className={`cursor-pointer flex items-center gap-2 transition duration-200 ${
              activeSection === "transactions" &&
              "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
            }`}
          >
            <CreditCard size={20} />
            Transakcje
          </span>
          <span
            onClick={() => setActiveSection("promoCodes")}
            className={`cursor-pointer flex items-center gap-2 transition duration-200 ${
              activeSection === "promoCodes" &&
              "border-l-6 px-2 border-secondaryBlue text-secondaryBlue dark:border-primaryGreen dark:text-primaryGreen"
            }`}
          >
            <Tag size={20} />
            Kody promocyjne
          </span>
        </div>

        <button
          onClick={() => {
            setIsDark((prev) => {
              const newValue = !prev;
              localStorage.setItem("theme", newValue ? "dark" : "light");
              return newValue;
            });
          }}
          className="cursor-pointer py-3 items-center justify-center bg-gray-200 dark:bg-DarkblackText rounded-[8px] flex w-full"
          title="Przełącz tryb jasny/ciemny"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}
