import { memo, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Book, MessageCircleQuestionIcon, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";
import BlogList from "./BlogList";
import Error from "../systemLayouts/Error";
import Loading from "../systemLayouts/Loading";
import ReportPanel from './ReportPanel';

const tierStyles = {
  Trudny: "bg-gradient-to-r from-rose-500 to-pink-600 text-white",
  Łatwy: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
  Średni: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black/80",
};

const videoResources = [
  { title: "Kurs Java dla początkujących", description: "Poznaj podstawy Javy krok po kroku." },
  { title: "Zaawansowany React", description: "Buduj skalowalne aplikacje z React + Zustand." },
  { title: "Podstawy UI/UX", description: "Dowiedz się jak tworzyć nowoczesne interfejsy." },
];

const ResourceVideo = memo(({ videoTitle, videoDescription }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    className="w-full bg-white dark:bg-blackText dark:text-white cursor-pointer rounded-2xl shadow-md transition-all duration-300"
  >
    <div className="px-5 py-6">
      <h4 className="font-semibold text-lg mb-1 truncate text-primaryBlue dark:text-primaryGreen">
        {videoTitle}
      </h4>
      <p className="text-sm opacity-70 break-words line-clamp-3 leading-snug">{videoDescription}</p>
    </div>
  </motion.div>
));

const CourseItem = memo(({ course, onClick }) => (
  <motion.li
    className="flex p-4 border rounded-[12px] border-blackText/10 dark:text-white dark:bg-DarkblackText shadow-md text-blackText"
  >
    <img
      src={course.image_url}
      alt="course img"
      className="w-full sm:w-64 h-40 sm:h-auto object-cover rounded-[12px] flex-shrink-0"
    />
    <div className="px-4 flex  flex-1 min-w-0">
      <div className="grid grid-cols-2 gap-8 w-full border-blackText/20 ">

      <div className="pr-4 border-r border-blackText/15 dark:border-white/20 flex flex-col justify-between">
      <div>
  <h3 className="font-bold text-lg sm:text-xl w-full">{course.title}</h3>
            <p className="text-sm opacity-70 w-full break-words line-clamp-4 sm:line-clamp-6 overflow-hidden leading-snug">
              {course.description}
            </p>
      </div>
          <button className="w-full py-3 bg-gradient-to-br from-primaryGreen to-secondaryGreen transition-discrete hover:-translate-y-1 duration-300 hover:shadow-md rounded-[12px] text-white font-semibold cursor-pointer" 
          onClick={() => onClick(course.id)}
          >Zobacz kurs</button>
      </div>
     

      <div className="flex flex-col gap-4">
        <div>
  <h2 className="text-xl font-bold">Kurs zawiera</h2>
        <div className="w-full grid grid-rows-1 grid-cols-3 text-center gap-4 items-center mt-2">
          <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-4 py-3 rounded-[8px]">4 działy</div>
          <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-4 py-3 rounded-[8px]">100+ lekcji</div>
          <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-4 py-3 rounded-[8px]">100+ zadań</div>
        </div>
        
        </div>
        <div>
  <h2 className="text-xl font-bold">Używane narzędzia</h2>
        <ol className="w-full grid grid-rows-3 grid-cols-1 gap-1 items-center mt-2 list-disc pl-4">
          <li className="opacity-75">Visual Studio Code</li>
          <li className="opacity-75">PyCharm</li>
          <li className="opacity-75">Xamp Control Panel</li>
        </ol>
        
        </div>
      
      </div>
      </div>
      
    
    </div>
  </motion.li>
));

function CourseList({ activePage, setTutorialVisible, tutorialVisible }) {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const { courses, loading: coursesLoading, error, fetchCourses } = useCourseStore();
  const { initialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized) fetchCourses();
  }, [initialized]);

  const handleNavigate = useCallback((id) => navigate(`/course/${id}`), [navigate]);

  if (!user) navigate("/authentication");

  const courseList = useMemo(() => courses.map((course) => (
    <CourseItem key={course.id} course={course} onClick={handleNavigate} />
  )), [courses, handleNavigate]);

  const videoList = useMemo(() => videoResources.map((video, index) => (
    <ResourceVideo key={index} videoTitle={video.title} videoDescription={video.description} />
  )), []);

  if (authLoading || coursesLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="flex flex-col items-center w-full ">
      <div className="flex flex-col lg:flex-row w-full">
        
        {/* <aside className="w-full lg:w-auto order-2 lg:order-1 flex-shrink-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <BlogList />
          </motion.div>
        </aside> */}

        <div className="flex-1 order-1 lg:order-2">
          <motion.div>
            <div className="flex flex-col items-center w-full bg-white shadow-md relative dark:bg-DarkblackBorder py-2 px-6 min-h-[98vh] rounded-[12px]">


              {/* TWOJE KURSY */}


              {activePage === "courses" && (
                courses.length > 0 ? (
                  <ul className="w-full flex flex-col gap-2 text-blackText  ">
                    <div className="w-full flex justify-between  mt-2 ">
                      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen">
                        Twoje kursy
                      </span>
                      <span className="text-primaryBlue cursor-pointer dark:text-primaryGreen" onClick={() => setTutorialVisible(!tutorialVisible)}>
                        <MessageCircleQuestionIcon></MessageCircleQuestionIcon>
                      </span>
                    </div>

                    <div className="flex flex-col mt-12">
                      <h2 className="flex gap-2 items-center text-lg font-bold uppercase mb-4 dark:text-white"><ShoppingCart className="font-bold"></ShoppingCart>Kursy które posiadasz :</h2>
                    <div className="flex flex-col gap-8">
                    {courseList}
                    </div>
                 
                    </div>
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <ShoppingCart size={40} className="text-primaryBlue dark:text-primaryGreen mb-3" />
                    <p className="text-lg dark:text-white">Nie posiadasz jeszcze żadnych kursów</p>
                  </div>
                )
              )}



              {/* ZASOBY */}


              {activePage === "resources" && 
                <div className="flex flex-col items-start w-full">
                  <h3 className="text-lg opacity-70 font-semibold text-blackText dark:text-white mb-4 flex items-center gap-2">
                    Zasoby do nauki <Book size={18} />
                  </h3>
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {videoList}
                  </div>
                </div>
              }

              {/* ZGŁOSZENIA */}

              {activePage === "reports" && 
                <ReportPanel />
              }
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CourseList;
