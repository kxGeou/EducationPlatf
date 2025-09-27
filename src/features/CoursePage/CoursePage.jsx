import Error from '../../components/systemLayouts/Error';
import Loading from '../../components/systemLayouts/Loading';
import ChartPanel from "./components/ChartPanel";
import CourseInfo from "./components/CourseInfo";
import CourseSidebar from "./components/CourseSidebar";
import FlashcardPanel from "./components/FlashCardPanel";
import TaskPanel from "./components/TaskPanel";
import VideoPanel from "./components/VideoPanel";
import UserData from "../MyCoursesPage/components/UserData";
import { useAuthStore } from '../../store/authStore';
import { useSingleCourseStore } from '../../store/singleCourseStore';
import Hls from "hls.js";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CoursePage({ isDark, setIsDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userDataModal, setUserDataModal] = useState(false);

  const { user, loading: authLoading, initialized } = useAuthStore();
  const { fetchCourseById, course, videos, loading, error, accessDenied } =
    useSingleCourseStore();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [activeSection, setActiveSection] = useState("video");

  useEffect(() => {
    if (initialized) {
      fetchCourseById(id);
    }
  }, [initialized, id]);

  const HlsPlayer = ({ src, title }) => {
    const videoRef = useRef(null);

    useEffect(() => {
      let hls;
      if (videoRef.current) {
        if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = src;
        } else if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(videoRef.current);
        }
      }
      return () => {
        if (hls) hls.destroy();
      };
    }, [src]);

    return (
      <video
        ref={videoRef}
        controls
        className="w-full h-full rounded bg-black"
        title={title}
        style={{ objectFit: "contain" }}
      />
    );
  };

  if (!initialized || authLoading || loading) return <Loading />;
  if (accessDenied || error || !course) return <Error />;

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className=" flex justify-center bg-slate-300 dark:bg-blackText dark:text-white min-h-screen"
    >
      <div className="flex flex-col md:flex-row h-full gap-4 w-full max-w-[1900px] min-h-screen p-2">
        <CourseSidebar
          user={user}
          course={course}
          videos={videos}
          currentVideo={currentVideo}
          setCurrentVideo={setCurrentVideo}
          isDark={isDark}
          setIsDark={setIsDark}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setUserDataModal={setUserDataModal}
          userDataModal={userDataModal}
        />

        <main className="flex flex-col w-full items-start min-h-[98vh] bg-gray-100 dark:bg-DarkblackBorder rounded-[12px] p-2">

          {activeSection === "info" && (
            <CourseInfo course={course} videos={videos} />
          )}
          {activeSection === "video" && (
            <VideoPanel
              videos={videos}
              currentVideo={currentVideo}
              setCurrentVideo={setCurrentVideo}
              HlsPlayer={HlsPlayer}
              isDark={isDark}
            />
          )}

          {activeSection === "flashcards" && (
            <FlashcardPanel courseId={course.id} />
          )}

          {activeSection === "tasks" && (
            <TaskPanel courseId={course.id} />
          )}
          {activeSection === "chart" && (
            <ChartPanel course={course} user={user} videos={videos} />
          )}
    
          
        </main>
      </div>
      {userDataModal && (
        <UserData
          userDataModal={userDataModal}
          setUserDataModal={setUserDataModal}
        />
      )}
    </div>
  );
}
