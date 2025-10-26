import { useState, useRef, useEffect } from "react";
import { useExamStore } from '../../../store/examStore';

export default function ExamSettings() {
  const courses = useExamStore((s) => s.courses);
  const [course, setCourse] = useState("");
  const [numQ, setNumQ] = useState(10);
  const startExam = useExamStore((s) => s.startExam);
  const startRandomQuestionMode = useExamStore((s) => s.startRandomQuestionMode);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [dropdownOpen]);

  const selectedCourse = courses.find((c) => c.id === course);

  return (
    <div className="bg-white  dark:bg-DarkblackBorder rounded-lg shadow-xl p-6 border border-gray-100 dark:border-DarkblackText">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold mb-3 bg-gradient-to-r dark:from-primaryGreen dark:to-secondaryGreen from-primaryBlue to-secondaryBlue bg-clip-text text-transparent">
          Wybierz egzamin oraz ilość pytań
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Rozpocznij swój egzamin lub spróbuj losowego pytania
        </p>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Wybierz kurs
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="w-full border-2 border-gray-200 dark:border-DarkblackText p-4 rounded-lg flex justify-between items-center bg-white dark:bg-DarkblackText hover:border-primaryBlue dark:hover:border-primaryGreen hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen cursor-pointer"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            <span className={selectedCourse ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"}>
              {selectedCourse ? selectedCourse.title : "Wybierz kurs"}
            </span>
            <svg className={`w-5 h-5 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {dropdownOpen && (
            <ul className="absolute z-20 w-full bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl border border-gray-200 dark:border-DarkblackText mt-2 max-h-60 overflow-auto">
              {courses.map((c) => (
                <li
                  key={c.id}
                  className={`p-4 cursor-pointer hover:bg-primaryBlue/5 dark:hover:bg-primaryGreen/5 transition-colors duration-150 ${course === c.id ? "text-primaryBlue dark:text-primaryGreen font-semibold bg-primaryBlue/10 dark:bg-primaryGreen/10" : "text-gray-700 dark:text-gray-300"}`}
                  onClick={() => {
                    setCourse(c.id);
                    setDropdownOpen(false);
                  }}
                >
                  {c.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Liczba pytań
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[10, 20, 40].map((n) => (
            <button
              key={n}
              className={`px-4 py-4 rounded-xl transition-all duration-200 font-semibold text-lg ${
                numQ === n 
                  ? "bg-primaryBlue dark:bg-primaryGreen text-white shadow-lg transform " 
                  : "bg-gray-100 dark:bg-DarkblackText hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10 hover:shadow-md border-2 border-transparent hover:border-primaryBlue/20 dark:hover:border-primaryGreen/20"
              }`}
              onClick={() => setNumQ(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <button
          className="w-full px-6 py-4 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryGreen text-white font-semibold text-lg rounded-xl hover:shadow-xl hover:-translate-y-1 duration-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          onClick={() => startExam({ courseId: course, numQuestions: numQ })}
          disabled={!course}
        >
          Zacznij test
        </button>
        
        <button
          className="w-full px-6 py-4 bg-gradient-to-r from-secondaryBlue to-secondaryGreen text-white font-semibold text-lg rounded-xl hover:shadow-xl hover:-translate-y-1 duration-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          onClick={() => startRandomQuestionMode(course)}
          disabled={!course}
        >
          Losowe Pytanie
        </button>
      </div>
    </div>
  );
}