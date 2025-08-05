import { useNavigate } from "react-router-dom";
import CourseProgressPanel from "./CourseProgressPanel";
import UserPanel from "./UserPanel";
import VideoSectionList from "./VideoSectionList";
import { ChartColumnBig, Clapperboard, Moon, NotepadText, SearchCode, Sun, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import UserData from "../userPage/UserData";

export default function CourseSidebar({
  user,
  course,
  videos,
  currentVideo,
  setCurrentVideo,
  isDark,
  setIsDark,
  activeSection,
  setActiveSection,
  userDataModal,
  setUserDataModal
}) {
  // console.log(course);
  // console.log(videos)
  const maturaDate = new Date("2026-05-05T08:00:00");
  const navigate = useNavigate();
  const getTimeRemaining = () => {
    const now = new Date();
    const total = maturaDate - now;

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    return { total, days, hours, minutes, seconds };
  };
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <aside
      data-theme={isDark ? "dark" : "light"}
      className="h-[96vh] rounded-[12px] bg-white dark:bg-DarkblackBorder shadow-lg flex flex-col justify-between"
    >
      <div>
        <UserPanel user={user} isDark={isDark} setIsDark={setIsDark}      setUserDataModal={setUserDataModal}
          userDataModal={userDataModal} />

        <nav className="px-4 flex flex-col gap-2">
          <h3 className="text-sm text-gray-400 mb-1">Nawigacja </h3>
          <button
            onClick={() => setActiveSection("info")}
            className={`w-full flex gap-2 cursor-pointer rounded-[12px] dark:border shadow-md dark:border-DarkblackBorder items-center text-left px-4 py-2 text-lg ${
              activeSection === "info"
                ? "text-white bg-secondaryBlue dark:bg-blackText border-secondaryGreen/50"
                : " hover:bg-secondaryBlue/25 dark:hover:bg-DarkblackText"
            }`}
          >
            <SearchCode size={20}></SearchCode> O kursie
          </button>
          <button
            onClick={() => setActiveSection("video")}
             className={`w-full flex gap-2 cursor-pointer rounded-[12px] dark:border shadow-md dark:border-DarkblackBorder items-center text-left px-4 py-2 text-lg ${
              activeSection === "video"
                     ? "text-white bg-secondaryBlue dark:bg-blackText border-secondaryGreen/50"
                : " hover:bg-secondaryBlue/25 dark:hover:bg-DarkblackText"
            }`}
          >
            <Clapperboard size={20}></Clapperboard> Lekcje wideo
          </button>
          <button
            onClick={() => setActiveSection("flashcards")}
              className={`w-full flex gap-2 cursor-pointer rounded-[12px] dark:border shadow-md dark:border-DarkblackBorder items-center text-left px-4 py-2 text-lg ${
              activeSection === "flashcards"
              ? "text-white bg-secondaryBlue dark:bg-blackText border-secondaryGreen/50"
                : " hover:bg-secondaryBlue/25 dark:hover:bg-DarkblackText"
            }`}
          >
            <NotepadText size={20}></NotepadText> Fiszki
          </button>
          <button
            onClick={() => setActiveSection("chart")}
              className={`w-full gap-2 cursor-pointer flex rounded-[12px] dark:border shadow-md dark:border-DarkblackBorder items-center text-left px-4 py-2 text-lg ${
              activeSection === "chart"
          ? "text-white bg-secondaryBlue dark:bg-blackText border-secondaryGreen/50 "
                : " hover:bg-secondaryBlue/25 dark:hover:bg-DarkblackText"
            }`}
          >
            <ChartColumnBig size={20}></ChartColumnBig> Statystyki
          </button>
          <a
            onClick={() => navigate("/user_page")}
             className={`w-full flex gap-2 items-center text-left px-4 py-2 text-lg cursor-pointer bg-primaryGreen rounded-[12px] text-white`}
          >
            <Undo2 size={20}></Undo2> Powrót
          </a>
        </nav>
      </div>

      <div className="py-4 px-5 flex flex-col items-start w-full">
        <div
          onClick={() => {
            setIsDark((prev) => {
              const newValue = !prev;
              localStorage.setItem("theme", newValue ? "dark" : "light");
              return newValue;
            });
          }}
          className="cursor-pointer mb-4 hover:text-gray-300 transition-all"
          title="Przełącz tryb jasny/ciemny"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </div>
        <p className="text-md text-blackText/50 dark:text-white/50 gap-1  flex flex-col">
          Czas do matury
          <span className="font-bold text-blackText dark:text-white text-lg">
            {String(timeLeft.days).padStart(2, "0")} Dni
            {/* {String(timeLeft.hours).padStart(2, "0")}h :{" "}
            {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
            {String(timeLeft.seconds).padStart(2, "0")}s */}
          </span>
        </p>
      </div>

      {/* {activeSection === "video" && (
        <VideoSectionList
          videos={videos}
          currentVideo={currentVideo}
          setCurrentVideo={setCurrentVideo}
          isDark={isDark}
        />
      )} */}

    </aside>
  );
}
