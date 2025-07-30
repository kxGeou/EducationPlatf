import { useNavigate } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/kurs/${course.id}`);
  };

  return (
    <div
      className="relative shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex flex-col items-start pb-4 cursor-pointer rounded-[12px] overflow-hidden group dark:bg-DarkblackBorder"
      onClick={handleClick}
    >
      <img
        src="react2.png"
        alt="mockup image"
        className="max-h-50 w-full rounded-t-[12px] mb-3"
      />

      <div className="flex items-center justify-center gap-2 absolute top-3 left-4 bg-secondaryGreen/75 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-1 rounded-[8px] opacity-0 -translate-x-10 group-hover:-translate-x-1 group-hover:opacity-100 transition-all duration-300 z-10 shadow-sm">
        Zobacz szczegóły <Lightbulb size={15} />
      </div>

      <div className="px-4 flex flex-col ">
        <h2 className="text-xl font-semibold text-blackText dark:text-white">{course.title}</h2>
        <p className="text-blackText/50 dark:text-white/75 text-sm">{course.description}</p>
      </div>

      <div className="flex flex-col items-start gap-1 w-full px-4 mt-3">
        <span className="flex gap-2 items-center">
          <p className="text-lg text-blackText dark:text-white">
            {(course.price_cents ? course.price_cents : course.price) + ' zł'}
          </p>
          <p className="text-md text-blackText/5 dark:text-white/50 line-through">220 zł</p>
        </span>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 dark:from-blue-700 dark:via-indigo-700 dark:to-green-700 via-indigo-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-0"></div>
    </div>
  );
}
