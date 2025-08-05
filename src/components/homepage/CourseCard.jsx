import { BadgeCheck, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {
  const navigate = useNavigate();



  return (
    <a
      // onClick={handleClick}
      href={`/kurs/${course.id}`}
      className="group relative flex flex-col md:flex-row cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-DarkblackBorder hover:scale-[1.010]"
    >
      <img
        src="react2.png"
        alt={`Obrazek kursu ${course.title}`}
        className="w-full md:w-72 h-48 md:h-auto object-cover md:rounded-l-2xl rounded-t-2xl md:rounded-t-none"
      />

      <div className="flex flex-col justify-between flex-1 p-6 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-blackText dark:text-white mb-1">
            {course.title}
          </h2>
          <p className="text-sm text-blackText/60 dark:text-white/70 line-clamp-3">
            {course.description}
          </p>
        </div>

        <div className="flex flex-col md:flex-row w-full justify-between gap-6 ">
          <div className="w-full flex flex-col gap-4 pr-4 md:border-r md:border-gray-300">
            <h3 className="text-lg font-semibold dark:text-white">
              Kurs Zawiera
            </h3>
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              <div className=" p-2 rounded-[8px] bg-primaryGreen flex items-center justify-center font-semibold text-white dark:text-blackText">
                4 działy
              </div>
              <div className=" p-2 rounded-[8px] bg-primaryGreen flex items-center justify-center font-semibold text-white dark:text-blackText">
                100+ lekcji
              </div>
              <div className=" p-2 rounded-[8px] bg-primaryGreen flex items-center justify-center font-semibold text-white dark:text-blackText">
                100+ zadań
              </div>
              <div className=" p-2 rounded-[8px] bg-primaryGreen flex items-center justify-center font-semibold text-white dark:text-blackText">
                próbny test
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-4">
            <h3 className="text-lg font-semibold dark:text-white">
              Nauczysz się
            </h3>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-2 text-md dark:text-white/75">
                <BadgeCheck
                  size={20}
                  className="text-primaryGreen"
                ></BadgeCheck>{" "}
                Programowania
              </li>
              <li className="flex items-center gap-2 text-md dark:text-white/75">
                <BadgeCheck
                  size={20}
                  className="text-primaryGreen"
                ></BadgeCheck>{" "}
                Tworzenia stron
              </li>
              <li className="flex items-center gap-2 text-md dark:text-white/75">
                <BadgeCheck
                  size={20}
                  className="text-primaryGreen"
                ></BadgeCheck>{" "}
                Tworzenia baz daych
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-4 bg-secondaryGreen/80 text-white text-xs px-3 py-1 rounded-lg border border-white/20 backdrop-blur-sm flex items-center gap-2 opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
        Zobacz szczegóły <Lightbulb size={16} />
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-green-500 dark:from-blue-700 dark:via-indigo-700 dark:to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </a>
  );
}
