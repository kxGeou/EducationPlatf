import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore"; 
import Error from "../systemLayouts/Error";
import Loading from "../systemLayouts/Loading";
import BlogList from "./BlogList";
import { motion } from "framer-motion";
import { Book } from "lucide-react";
import { useMemo, useCallback, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const tierStyles = {
  Trudny: "bg-[#db4266] text-white",
  Łatwy: "bg-[#3b9c4e] text-white",
  Średni: "bg-[#f5d32c] text-black/75",
};

const videoResources = [
  {
    title: "Kurs Java dla początkujących",
    description: "Wszystkie przydatne informacje są zawarte w tym kursie",
  },
  {
    title: "Kurs Java dla początkujących",
    description: "Wszystkie przydatne informacje są zawarte w tym kursie",
  },
  {
    title: "Kurs Java dla początkujących",
    description: "Wszystkie przydatne informacje są zawarte w tym kursie",
  },
];

const ResourceVideo = memo(({ videoTitle, videoDescription }) => (
  <div className="w-full bg-white dark:bg-DarkblackBorder cursor-pointer rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
    <div className="px-4 py-6">
      <p className="font-bold text-lg">{videoTitle}</p>
      <span className="text-md opacity-50">{videoDescription}</span>
    </div>
  </div>
));

const CourseItem = memo(({ course, onClick }) => (
  <div className="flex justify-center md:justify-between items-center gap-16 px-4 md:px-0 md:ml-6">
    <div className="md:flex flex-col items-start gap-3 w-[50%] hidden">
      <h3 className="font-bold text-4xl">{course.section_title}</h3>
      <p className="text-md opacity-75">{course.section_description}</p>
    </div>
    <li
      className="my-2 w-full max-w-[400px] shadow-lg cursor-pointer hover:scale-102 hover:shadow-xl rounded-xl pb-4 bg-white transition-all duration-300 dark:bg-DarkblackBorder"
      onClick={() => onClick(course.id)}
    >
      <img
        src="./react2.png"
        alt="course img"
        className="w-full h-40 rounded-t-xl"
      />
      <div className="px-4 flex flex-col items-start pt-4 ">
        <h2 className="font-bold text-lg">{course.title}</h2>
        <p className="opacity-50  line-clamp-2">{course.description}</p>
        <div className="flex gap-3 items-center w-full mt-4">
          <span className="bg-blue-400 text-white px-2 py-1 rounded-lg text-sm">
            {course.time_to_complete}
          </span>
          {tierStyles[course.difficulty] && (
            <span
              className={`px-2 py-1 text-sm rounded-lg ${
                tierStyles[course.difficulty]
              }`}
            >
              {course.difficulty}
            </span>
          )}
        </div>
      </div>
    </li>
  </div>
));

function CourseList({ pageChange }) {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);

  const { courses, loading: coursesLoading, error, fetchCourses } = useCourseStore();
  const navigate = useNavigate();


  useEffect(() => {
    fetchCourses(); 
  }, [fetchCourses]);

  const handleNavigate = useCallback(
    (id) => {
      navigate(`/course/${id}`);
    },
    [navigate]
  );

  if(!user) {
    navigate("/authentication")
  }

  const courseList = useMemo(
    () =>
      courses.map((course) => (
        <CourseItem key={course.id} course={course} onClick={handleNavigate} />
      )),
    [courses, handleNavigate]
  );

  const videoList = useMemo(
    () =>
      videoResources.map((video, index) => (
        <ResourceVideo
          key={index}
          videoTitle={video.title}
          videoDescription={video.description}
        />
      )),
    []
  );

  if (authLoading || coursesLoading) return <Loading />;
  if (error) return <Error />;
  if (!courses.length && pageChange) return <p>Nie masz żadnych kursów.</p>;

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="flex flex-col lg:flex-row w-full max-w-[1400px] gap-4 px-4 ">
        <div className="hidden lg:block w-full max-w-[300px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <BlogList />
          </motion.div>
        </div>

        <div className="flex-1 bg-white dark:bg-DarkblackText dark:text-white px-6 py-4 rounded-[12px] shadow-lg ">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col items-center">
              {pageChange ? (
                <ul className="w-full flex flex-col gap-16 max-h-[80vh] overflow-y-scroll">{courseList}</ul>
              ) : (
                <div className="flex flex-col items-start">
                  <h3 className="text-lg opacity-50 font-semibold text-blackText dark:text-white mb-2 flex items-center gap-2">
                    Zasoby do nauki <Book size={16} />
                  </h3>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
