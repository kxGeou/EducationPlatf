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
import { BookOpen } from 'lucide-react';
import { useEbookStore } from '../../store/ebookStore';
// DEV: END VideoPanel import
import { useAuthStore } from '../../store/authStore';
import { useSingleCourseStore } from '../../store/singleCourseStore';
import { useCartStore } from '../../store/cartStore';
import supabase from '../../util/supabaseClient';
import Hls from "hls.js";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";

export default function CoursePage({ isDark, setIsDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [userDataModal, setUserDataModal] = useState(false);

  const { user, loading: authLoading, initialized, purchasedEbooks } = useAuthStore();
  const { fetchCourseById, course, videos, loading, error, accessDenied } =
    useSingleCourseStore();
  const { fetchEbookById, currentEbook: ebook } = useEbookStore();
  const { clearCart } = useCartStore();

  const [currentVideo, setCurrentVideo] = useState(null);
  // DEV: activeSection - jeśli jest w URL params, użyj go, w przeciwnym razie domyślnie "info"
  const sectionParam = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionParam || "info");
  // DEV: END activeSection
  const [selectedEbookId, setSelectedEbookId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [courseEbooks, setCourseEbooks] = useState([]);
  const [loadingCourseEbooks, setLoadingCourseEbooks] = useState(false);

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

  // Resetuj selectedEbookId gdy przełączasz się na sekcję ebook, aby zawsze pokazać listę
  useEffect(() => {
    if (activeSection === "ebook") {
      setSelectedEbookId(null);
    }
  }, [activeSection]);

  // Pobierz ebooki dla tego kursu gdy activeSection === "ebook"
  // NIE ustawiaj automatycznie selectedEbookId - użytkownik MUSI wybrać z listy
  useEffect(() => {
    async function fetchCourseEbooks() {
      if (activeSection === "ebook" && course?.id && initialized && purchasedEbooks && purchasedEbooks.length > 0) {
        setLoadingCourseEbooks(true);
        try {
          const { data, error } = await supabase
            .from('ebooks')
            .select('*')
            .eq('course_id', course.id)
            .in('id', purchasedEbooks)
            .order('created_at', { ascending: false });
          
          if (!error && data) {
            setCourseEbooks(data);
            // NIGDY nie ustawiaj automatycznie - użytkownik MUSI wybrać z listy
          }
        } catch (err) {
          console.log('Error fetching course ebooks:', err);
          setCourseEbooks([]);
        } finally {
          setLoadingCourseEbooks(false);
        }
      } else {
        setCourseEbooks([]);
      }
    }
    
    fetchCourseEbooks();
  }, [activeSection, course?.id, initialized, purchasedEbooks]);

  // DEV: Fetch ebook when selected
  useEffect(() => {
    if (selectedEbookId && initialized) {
      fetchEbookById(selectedEbookId);
    }
  }, [selectedEbookId, initialized, purchasedEbooks]);
  // DEV: END Fetch ebook

  // Clear cart when leaving /course route
  useEffect(() => {
    // Cleanup: clear cart when component unmounts (user navigates away from /course)
    return () => {
      clearCart();
    };
  }, [clearCart]);

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
      className=" flex justify-center bg-slate-300 dark:bg-blackText dark:text-white h-screen overflow-hidden"
    >
      <div className="flex flex-col md:flex-row h-full gap-1 w-full max-w-[2560px] p-1 overflow-hidden">
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

        <main className={`flex flex-col w-full items-start h-full rounded-2xl p-2 overflow-y-auto hide-scrollbar ${activeSection === "ebook" ? "bg-white dark:bg-DarkblackText" : "bg-gray-100 dark:bg-DarkblackBorder"}`}>

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
          {activeSection === "ebook" && (
            <>
              {/* Jeśli nie wybrano jeszcze ebooka, ZAWSZE pokaż listę ebooków */}
              {!selectedEbookId ? (
                loadingCourseEbooks ? (
                  <div className="w-full flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
                  </div>
                ) : courseEbooks.length > 0 ? (
                  <div className="flex flex-col gap-8 w-full md:min-h-[96vh] p-3">
                    <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen">
                      E-booki
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courseEbooks.map((courseEbook) => (
                        <div
                          key={courseEbook.id}
                          onClick={() => setSelectedEbookId(courseEbook.id)}
                          className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-DarkblackText hover:-translate-y-1"
                        >
                          {courseEbook.image_url && (
                            <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-DarkblackText">
                              <img
                                src={courseEbook.image_url}
                                alt={courseEbook.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {courseEbook.title}
                            </h3>
                            {courseEbook.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {courseEbook.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Nie masz jeszcze żadnych ebooków dla tego kursu.
                    </p>
                  </div>
                )
              ) : ebook && selectedEbookId ? (
                <EbookViewerPanel ebook={ebook} />
              ) : null}
            </>
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
            <UserData isInCourse={true} />
          )}
    
          
        </main>
      </div>
      {userDataModal && (
        <UserData
          userDataModal={userDataModal}
          setUserDataModal={setUserDataModal}
          isInCourse={true}
        />
      )}
    </div>
  );
}
