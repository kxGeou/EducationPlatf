import { useState, useRef, useEffect } from "react";
import { useExamStore } from "../../store/examStore";

export default function ExamSettings() {
  const subjects = useExamStore((s) => s.subjects);
  const [subject, setSubject] = useState("");
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

  const selectedSubject = subjects.find((s) => s.id === subject);

  return (
    <div>
      <h2 className="font-bold mb-2 text-xl">Wybierz egzamin oraz ilość pytań</h2>
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          type="button"
          className="w-full border p-4 rounded-[12px] flex justify-between items-center bg-white border-gray-200 dark:bg-DarkblackBorder dark:border-DarkblackText  hover:shadow-md transition-all duration-200 focus:outline-none cursor-pointer"
          onClick={() => setDropdownOpen((open) => !open)}
        >
          <span>{selectedSubject ? selectedSubject.title : "Wybierz dział"}</span>
          <svg className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {dropdownOpen && (
          <ul className="absolute z-10 w-full bg-white dark:bg-DarkblackBorder rounded-[12px] shadow mt-1 max-h-60 overflow-auto p-2">
            {subjects.map((s) => (
              <li
                key={s.id}
                className={`p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-DarkblackText ${subject === s.id ? "text-primaryBlue dark:text-primaryGreen font-semibold" : ""}`}
                onClick={() => {
                  setSubject(s.id);
                  setDropdownOpen(false);
                }}
              >
                {s.title}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-3 w-full gap-3 md:gap-4 mt-4">
        {[10, 20, 40].map((n) => (
          <button
            key={n}
            className={`px-3 py-2 md:py-3 rounded-[12px] transition-colors cursor-pointer duration-150 shadow-sm ${numQ === n ? "bg-primaryBlue dark:bg-primaryGreen text-white" : "bg-white dark:bg-DarkblackBorder hover:bg-secondaryBlue dark:hover:bg-secondaryGreen hover:text-white"}`}
            onClick={() => setNumQ(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        className="mt-4 px-4 py-3 bg-primaryBlue dark:bg-primaryGreen dark:hover:bg-secondaryGreen w-full rounded-[12px] hover:-translate-y-1 duration-300 hover:shadow-md  hover:bg-secondaryBlue transition-all cursor-pointer text-white "
        onClick={() => startExam({ subjectId: subject, numQuestions: numQ })}
        disabled={!subject}
      >
        Start Full Exam
      </button>
      
      <button
        className="mt-3 px-4 py-3 bg-primaryBlue dark:bg-primaryGreen dark:hover:bg-secondaryGreen w-full rounded-[12px] hover:-translate-y-1 duration-300 hover:shadow-md hover:bg-secondaryBlue transition-all cursor-pointer text-white "
        onClick={() => startRandomQuestionMode(subject)}
        disabled={!subject}
      >
         Losowe Pytanie
      </button>
    </div>
  );
}