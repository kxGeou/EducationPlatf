import { BadgeCheck, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/kurs/${course.id}`);
  }

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col md:flex-row cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-DarkblackBorder hover:-translate-y-1"
    >
      <img
        src={course.image_url}
        alt={`Grafika kursu online ${course.title} – przygotowanie do matury z informatyki`}
        className="w-full md:w-72 h-48 md:h-auto object-cover md:rounded-l-2xl rounded-t-2xl md:rounded-t-none"
        loading="lazy"
      />

      <div className="flex flex-col justify-between flex-1 p-6 gap-8">
        <div>
          <h3 className="text-2xl font-semibold text-blackText dark:text-white mb-1">
            {course.title}
          </h3>
          <p className="text-sm text-blackText/60 dark:text-white/70 line-clamp-3">
            {course.description}
          </p>
        </div>

        <div className="flex flex-col w-full justify-between gap-6">
          <div className="w-full flex flex-col gap-4">
            <h4 className="text-lg font-semibold dark:text-white">Kurs zawiera</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-2 rounded-[8px] bg-primaryBlue dark:bg-primaryGreen shadow flex items-center justify-center font-semibold text-white dark:text-blackText">
                {course.sections || "4"} działy
              </div>
              <div className="p-2 rounded-[8px] bg-primaryBlue dark:bg-primaryGreen shadow flex items-center justify-center font-semibold text-white dark:text-blackText">
                {course.lessons || "100+"} lekcji
              </div>
              <div className="p-2 rounded-[8px] bg-primaryBlue dark:bg-primaryGreen shadow flex items-center justify-center font-semibold text-white dark:text-blackText">
                {course.tasks || "100+"} zadań
              </div>
              {course.has_mock_exam && (
                <div className="p-2 rounded-[8px] bg-primaryGreen shadow flex items-center justify-center font-semibold text-white dark:text-blackText">
                  próbny test
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <h4 className="text-lg font-semibold dark:text-white">Nauczysz się</h4>
            <ul className="flex flex-wrap gap-4">
              <li className="flex items-center gap-2 text-md dark:text-white/75">
                <BadgeCheck size={20} className="text-primaryBlue dark:text-primaryGreen" />
                Programowania
              </li>
              <li className="flex items-center gap-2 text-md dark:text-white/75">
                <BadgeCheck size={20} className="text-primaryBlue dark:text-primaryGreen" />
                Tworzenia stron
              </li>
              <li className="flex items-center gap-2 text-md dark:text-white/75">
                <BadgeCheck size={20} className="text-primaryBlue dark:text-primaryGreen" />
                Tworzenia baz danych
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-4 bg-secondaryGreen/80 text-white text-xs px-3 py-1 rounded-lg border border-white/20 backdrop-blur-sm flex items-center gap-2 opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
        Zobacz szczegóły <Lightbulb size={16} />
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-green-500 dark:from-blue-700 dark:via-indigo-700 dark:to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
}
