import { TimerIcon } from "lucide-react";
import PageLayout from "../components/systemLayouts/PageLayout";
import ExamSettings from "../components/questions/ExamSettings";
import QuestionCard from "../components/questions/QuestionCard";
import RandomQuestionCard from "../components/questions/RandomQuestionCard";
import ResultView from "../components/questions/ResultView";
import { useExamStore } from "../store/examStore";
import { useEffect, useRef, useState } from "react";
import Biurko from '../assets/RobotBiurko.svg'

export default function ExamPage({ isDark, setIsDark }) {
  const fetchSubjects = useExamStore((s) => s.fetchSubjects);
  const pool = useExamStore((s) => s.questionPool);
  const result = useExamStore((s) => s.result);
  const remaining = useExamStore((s) => s.remainingSeconds);
  const randomQuestionMode = useExamStore((s) => s.randomQuestionMode);
  const timerRef = useRef(null);
  const [showStickyTimer, setShowStickyTimer] = useState(false);

  useEffect(() => {
    fetchSubjects();
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
          const y = resultEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
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
      <div className="relative  mb-16 overflow-hidden">
        <div className="absolute "></div>
        <div className="relative flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 flex flex-col gap-6">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r dark:from-primaryGreen dark:via-secondaryBlue dark:to-secondaryGreen from-primaryBlue via-secondaryBlue to-primaryBlue bg-clip-text text-transparent">
              Wystaw swoje umiejętności na próbę
            </h1>
            <p className="text-base md:text-lg leading-relaxed opacity-80 max-w-[600px]">
              Rozwiąż teoretyczne egzaminy próbne z kwalifikacji{" "}
              <span className="font-bold text-primaryBlue dark:text-primaryGreen">INF 03</span>,{" "}
              <span className="font-bold text-primaryBlue dark:text-primaryGreen">INF 02</span> oraz{" "}
              <span className="font-bold text-primaryBlue dark:text-primaryGreen">test maturalny z informatyki</span>{" "}
              i sprawdź co wymaga powtórki bez zbędnego stresu
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="px-3 py-2 bg-white dark:bg-DarkblackBorder shadow-sm rounded-full text-sm font-medium">
                Egzaminy próbne
              </div>
              <div className="px-3 py-2 bg-white dark:bg-DarkblackBorder shadow-sm rounded-full text-sm font-medium">
                Timer
              </div>
              <div className="px-3 py-2 bg-white dark:bg-DarkblackBorder shadow-sm rounded-full text-sm font-medium">
                Wyniki
              </div>
            </div>
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
            <div ref={timerRef} className="mb-12 text-xl py-3 rounded-[12px] text-center sticky dark:bg-primaryGreen text-white font-bold bg-primaryBlue flex items-center justify-center gap-3 ">
              Pozostały czas: {formatTime(remaining)} <TimerIcon size={20}></TimerIcon>
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
                  <span className="text-xl font-bold dark:text-white">Pozostały czas: {formatTime(remaining)}</span>
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
