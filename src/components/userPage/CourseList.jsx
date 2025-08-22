import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";
import Error from "../systemLayouts/Error";
import Loading from "../systemLayouts/Loading";
import BlogList from "./BlogList";
import { motion } from "framer-motion";
import { Book, ShoppingCart } from "lucide-react";
import { useMemo, useCallback, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      <h4 className="qnt-semibold text-lg mb-1 truncate text-primaryBlue dark:text-primaryGreen">
        {videoTitle}
      </h4>
      <p className="text-sm opacity-70 line-clamp-3 leading-snug">{videoDescription}</p>
    </div>
  </motion.div>
));

const CourseItem = memo(({ course, onClick }) => (
  <motion.li
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="my-2 w-full border border-gray-200 dark:border-gray-700 shadow-md cursor-pointer hover:shadow-lg transiton-all duration-300 hover:-translate-y-1 rounded-2xl bg-white sm:bg-white dark:bg-blackText dark:text-white flex flex-col overflow-hidden"
    onClick={() => onClick(course.id)}
  >
    <img
      src={course.image_url}
      alt="course img"
      className="w-full h-40 md:h-75 object-cover"
    />
    <div className="px-4 py-3 flex flex-col flex-1 items-start">
      <h3 className="font-bold text-base md:text-lg mb-1 truncate w-full">{course.title}</h3>
      <p className="text-sm opacity-70 line-clamp-3 w-full">{course.description}</p>
      <div className="flex gap-2 flex-wrap items-center w-full mt-auto pt-3">
        <span className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs shadow-md">
          {course.time_to_complete}
        </span>
        {tierStyles[course.difficulty] && (
          <span
            className={`px-2 py-1 text-xs rounded-lg shadow-md ${tierStyles[course.difficulty]}`}
          >
            {course.difficulty}
          </span>
        )}
      </div>
    </div>
  </motion.li>
));

function CourseList({ pageChange }) {
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
    <div className="flex flex-col items-center mt-4">
      <div className="flex flex-col lg:flex-row w-full max-w-[1400px] gap-6 px-4">
        <aside className="hidden lg:block w-full max-w-[300px]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <BlogList />
          </motion.div>
        </aside>

        <div className="flex-1 px-0 sm:px-6 py-0 sm:py-6 rounded-none sm:rounded-2xl sm:shadow-lg sm:dark:bg-DarkblackBorder sm:bg-white dark:bg-transparent">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col items-center">
              {pageChange ? (
                courses.length > 0 ? (
                  <ul className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 max-h-full sm:max-h-[80vh] overflow-y-auto sm:pr-2">
                    {courseList}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                      <ShoppingCart size={40} className="text-primaryBlue dark:text-primaryGreen mb-3" />
                      <p className="text-lg dark:text-white ">Nie posiadasz jeszcze żadnych kursów</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-start w-full">
                  <h3 className="text-lg opacity-70 font-semibold text-blackText dark:text-white mb-4 flex items-center gap-2">
                    Zasoby do nauki <Book size={18} />
                  </h3>
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {videoList}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CourseList;
