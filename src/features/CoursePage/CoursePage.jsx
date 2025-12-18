import Error from '../../components/systemLayouts/Error';
import Loading from '../../components/systemLayouts/Loading';
// DEV: ChartPanel import - odkomentuj na development, zakomentuj na main
// import ChartPanel from "./components/ChartPanel";
// DEV: END ChartPanel import
import CourseInfo from "./components/CourseInfo";
import CourseSidebar from "./components/CourseSidebar";
// DEV: FlashcardPanel import - odkomentuj na development, zakomentuj na main
// import FlashcardPanel from "./components/FlashCardPanel";
// DEV: END FlashcardPanel import
import TaskPanel from "./components/TaskPanel";
// DEV: VideoPanel import - odkomentuj na development, zakomentuj na main
// import VideoPanel from "./components/VideoPanel";
import ShopPanel from "./components/ShopPanel";
import CartPanel from "./components/CartPanel";
import UserData from "../MyCoursesPage/components/UserData";
import EbookViewerPanel from "../EbookPage/components/EbookViewerPanel";
import EbookInfoPanel from "../EbookPage/components/EbookInfoPanel";
import EbookTasksPanel from "../EbookPage/components/EbookTasksPanel";
import { useEbookStore } from '../../store/ebookStore';
// DEV: END VideoPanel import
import { useAuthStore } from '../../store/authStore';
import { useSingleCourseStore } from '../../store/singleCourseStore';
import Hls from "hls.js";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

export default function CoursePage({ isDark, setIsDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userDataModal, setUserDataModal] = useState(false);

  const { user, loading: authLoading, initialized } = useAuthStore();
  const { fetchCourseById, course, videos, loading, error, accessDenied } =
    useSingleCourseStore();
  const { fetchEbookById, currentEbook: ebook } = useEbookStore();

  const [currentVideo, setCurrentVideo] = useState(null);
  // DEV: activeSection - jeśli jest w URL params, użyj go, w przeciwnym razie domyślnie "info"
  const sectionParam = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionParam || "info");
  // DEV: END activeSection
  const [selectedEbookId, setSelectedEbookId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // DEV: Automatyczne zamykanie sidebara gdy włączamy panel video - odkomentuj na development, zakomentuj na main
  // useEffect(() => {
  //   if (activeSection === "video") {
  //     setShowSidebar(false);
  //   }
  // }, [activeSection]);
  // DEV: END Automatyczne zamykanie sidebara

  useEffect(() => {
    if (initialized) {
      fetchCourseById(id);
    }
  }, [initialized, id]);

  // DEV: Fetch ebook when selected
  useEffect(() => {
    if (selectedEbookId && initialized) {
      fetchEbookById(selectedEbookId);
    }
  }, [selectedEbookId, initialized]);
  // DEV: END Fetch ebook

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
      <div className="flex flex-col md:flex-row h-full gap-1 w-full max-w-[1900px] min-h-screen p-1">
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
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          setSelectedEbookId={setSelectedEbookId}
        />

        <main className={`flex flex-col w-full items-start min-h-[98vh] rounded-[12px] p-2 ${activeSection === "ebook" ? "bg-white dark:bg-DarkblackText" : "bg-gray-100 dark:bg-DarkblackBorder"}`}>

          {activeSection === "info" && (
            <CourseInfo course={course} videos={videos} />
          )}
          {/* DEV: VideoPanel - odkomentuj na development, zakomentuj na main */}
          {/* {activeSection === "video" && (
            <VideoPanel
              videos={videos}
              currentVideo={currentVideo}
              setCurrentVideo={setCurrentVideo}
              HlsPlayer={HlsPlayer}
              isDark={isDark}
              setActiveSection={setActiveSection}
              setShowSidebar={setShowSidebar}
            />
          )} */}
          {/* DEV: END VideoPanel */}

          {activeSection === "shop" && (
            <ShopPanel
              course={course}
              isDark={isDark}
              setActivePage={() => window.location.href = '/user_page?section=profile'}
              setSelectedEbookId={setSelectedEbookId}
              setActiveSection={setActiveSection}
            />
          )}

          {/* DEV: Ebook sections - odkomentuj na development, zakomentuj na main */}
          {activeSection === "ebook-info" && ebook && (
            <EbookInfoPanel ebook={ebook} />
          )}
          {activeSection === "ebook" && ebook && (
            <EbookViewerPanel ebook={ebook} />
          )}
          {activeSection === "ebook-tasks" && selectedEbookId && (
            <EbookTasksPanel ebookId={selectedEbookId} />
          )}
          {/* DEV: END Ebook sections */}

          {activeSection === "cart" && (
            <CartPanel
              course={course}
              isDark={isDark}
              setActiveSection={setActiveSection}
            />
          )}

          {/* DEV: FlashcardPanel - odkomentuj na development, zakomentuj na main */}
          {/* {activeSection === "flashcards" && (
            <FlashcardPanel courseId={course.id} />
          )} */}
          {/* DEV: END FlashcardPanel */}

          {activeSection === "tasks" && (
            <TaskPanel courseId={course.id} />
          )}
          {/* DEV: ChartPanel - odkomentuj na development, zakomentuj na main */}
          {/* {activeSection === "chart" && (
            <ChartPanel course={course} user={user} videos={videos} />
          )} */}
          {/* DEV: END ChartPanel */}
          {activeSection === "profile" && (
            <UserData />
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
