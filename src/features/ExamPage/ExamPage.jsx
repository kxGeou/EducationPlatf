import Biurko from '../../assets/RobotBiurko.svg';
import ExamSettings from "./components/ExamSettings";
import QuestionCard from "./components/QuestionCard";
import RandomQuestionCard from "./components/RandomQuestionCard";
import ResultView from "./components/ResultView";
import PageLayout from '../../components/systemLayouts/PageLayout';
import { useExamStore } from '../../store/examStore';
import { TimerIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import '../../styles/AuthPage.css';
export default function ExamPage({ isDark, setIsDark }) {
  const fetchCourses = useExamStore((s) => s.fetchCourses);
  const pool = useExamStore((s) => s.questionPool);
  const result = useExamStore((s) => s.result);
  const remaining = useExamStore((s) => s.remainingSeconds);
  const randomQuestionMode = useExamStore((s) => s.randomQuestionMode);
  const timerRef = useRef(null);
  const [showStickyTimer, setShowStickyTimer] = useState(false);

  useEffect(() => {
    fetchCourses();
    const handleScroll = () => {
      if (!timerRef.current) return;
      const rect = timerRef.current.getBoundingClientRect();
      setShowStickyTimer(rect.top < 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (result) {
      setTimeout(() => {
        const resultEl = document.getElementById("result-view");
        if (resultEl) {
          const yOffset = -120;
          const y =
            resultEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  }, [result]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <PageLayout isDark={isDark} setIsDark={setIsDark}>
      <div className="exam-corner-gradient"></div>
      <div className="mb-16 overflow-hidden w-full">

        <div className="relative flex flex-col md:flex-row gap-8 items-center z-20">
          <div className="flex-1 flex flex-col gap-5">
            <h1 className="text-5xl md:text-7xl font-bold leading-[50px] md:leading-[80px]">
              Wystaw swoje umiejętności na próbę
            </h1>
            <p className="text-base md:text-lg leading-relaxed opacity-80 max-w-[600px]">
              Rozwiąż teoretyczne egzaminy próbne z kwalifikacji{" "}
              <span className="font-bold text-primaryBlue dark:text-primaryGreen">
                INF 03
              </span>
              ,{" "}
              <span className="font-bold text-primaryBlue dark:text-primaryGreen">
                INF 02
              </span>{" "}
              oraz{" "}
              <span className="font-bold text-primaryBlue dark:text-primaryGreen">
                test maturalny z informatyki
              </span>{" "}
              i sprawdź co wymaga powtórki bez zbędnego stresu
            </p>
      
          </div>
          <div className="flex-1 items-center justify-center min-h-[200px] hidden md:flex">
            <img src={Biurko} className="w-[28rem]" />
          </div>
        </div>
      </div>







      
      {!pool.length && !result && !randomQuestionMode ? (
        <ExamSettings />
      ) : randomQuestionMode ? (
        <RandomQuestionCard isDark={isDark} />
      ) : !result ? (
        <>
          <div
            ref={timerRef}
            className="mb-12 text-xl py-3 rounded-[12px] text-center sticky dark:bg-primaryGreen text-white font-bold bg-primaryBlue flex items-center justify-center gap-3 z-20"
          >
            Pozostały czas: {formatTime(remaining)}{" "}
            <TimerIcon size={20}></TimerIcon>
          </div>
          <form className="space-y-10">
            {pool.map((q) => (
              <div className="w-full">
                <QuestionCard isDark={isDark} key={q.id} q={q} />
              </div>
            ))}
          </form>
          <button
            onClick={() => useExamStore.getState().finishExam()}
            className="mt-6 px-4 py-3 bg-primaryBlue w-full max-w-[600px] text-white rounded-[12px] dark:bg-primaryGreen dark:hover:bg-secondaryGreen hover:bg-secondaryBlue hover:-translate-y-1 duration-300 hover:shadow-md transition-all cursor-pointer block mx-auto"
          >
            Zakończ test
          </button>
          {showStickyTimer && (
            <div className="fixed bottom-0 left-0 w-full flex justify-center z-50">
              <div className="bg-white border border-gray-200 dark:border-0 dark:bg-DarkblackText shadow-lg rounded-t-xl px-6 py-4 flex items-center justify-between gap-6 max-w-[600px] w-full">
                <span className="text-xl font-bold dark:text-white">
                  Pozostały czas: {formatTime(remaining)}
                </span>
                <button
                  onClick={() => useExamStore.getState().finishExam()}
                  className="hidden md:inline-block px-4 py-2 bg-primaryBlue text-white rounded-[12px] dark:bg-primaryGreen dark:hover:bg-secondaryGreen hover:bg-secondaryBlue hover:-translate-y-1 duration-300 hover:shadow-md transition-all cursor-pointer"
                >
                  Zakończ test
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div id="result-view">
          <ResultView />
        </div>
      )}
    </PageLayout>
  );
}
