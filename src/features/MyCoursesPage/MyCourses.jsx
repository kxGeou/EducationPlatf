import CourseList from "./components/CourseList";
import Navigation from "./components/Navigation";
import Tutorial from "./components/Tutorial";
import UserData from "./components/UserData";
import UserHeader from "./components/UserHeader";
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyCourses({ isDark, setIsDark }) {
  const [userDataModal, setUserDataModal] = useState(false);
  const [activePage, setActivePage] = useState("courses");
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [tutorialVisible, setTutorialVisible] = useState(true);

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="flex justify-center bg-slate-200 w-full dark:bg-blackText relative"
    >
      <div className="w-full max-w-[1920px] md:p-2">
        <div className="w-full">
          <div className="flex gap-3">
            <Navigation
              activePage={activePage}
              setActivePage={setActivePage}
              userDataModal={userDataModal}
              setUserDataModal={setUserDataModal}
              isDark={isDark}
              setIsDark={setIsDark}
            ></Navigation>

            <CourseList activePage={activePage} setTutorialVisible={setTutorialVisible} tutorialVisible={tutorialVisible}/>
          </div>
        </div>

        {userDataModal && (
          <UserData
            userDataModal={userDataModal}
            setUserDataModal={setUserDataModal}
          />
        )}

      </div>
        <Tutorial isDark={isDark} tutorialVisible={tutorialVisible} setTutorialVisible={setTutorialVisible}></Tutorial>

    </div>
  );
}
