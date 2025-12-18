import CourseList from "./components/CourseList";
import Navigation from "./components/Navigation";
import Tutorial from "./components/Tutorial";
import UserData from "./components/UserData";
import UserHeader from "./components/UserHeader";
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MyCourses({ isDark, setIsDark }) {
  const [activePage, setActivePage] = useState("courses");
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const section = searchParams.get('section');
    // DEV: 'resources', 'blogs', 'leaderboard', 'rewards' - odkomentuj na development, zakomentuj na main
    // if (section && ['courses', 'resources', 'reports', 'blogs', 'forms', 'ideas', 'leaderboard', 'rewards', 'referral', 'profile'].includes(section)) {
    if (section && ['courses', 'reports', 'forms', 'ideas', 'referral', 'profile'].includes(section)) {
      setActivePage(section);
    }
    // DEV: END 'resources', 'blogs', 'leaderboard', 'rewards'
  }, [searchParams]);

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="flex justify-center bg-slate-200 w-full dark:bg-blackText relative"
    >
      <div className="w-full max-w-[1920px] p-1">
        <div className="w-full">
          <div className="flex gap-1">
            <Navigation
              activePage={activePage}
              setActivePage={setActivePage}
              isDark={isDark}
              setIsDark={setIsDark}
            ></Navigation>

            <CourseList activePage={activePage} setActivePage={setActivePage} setTutorialVisible={setTutorialVisible} tutorialVisible={tutorialVisible}/>
          </div>
        </div>


      </div>
        <Tutorial isDark={isDark} tutorialVisible={tutorialVisible} setTutorialVisible={setTutorialVisible}></Tutorial>

    </div>
  );
}
