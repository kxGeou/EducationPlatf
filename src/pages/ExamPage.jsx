import { TimerIcon } from "lucide-react";
import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";
import ExamSettings from "../components/questions/ExamSettings";
import QuestionCard from "../components/questions/QuestionCard";
import ResultView from "../components/questions/ResultView";
import { useExamStore } from "../store/examStore";
import { useEffect, useRef, useState } from "react";
import Biurko from '../assets/RobotBiurko.svg'

export default function ExamPage({ isDark, setIsDark }) {
  const fetchSubjects = useExamStore((s) => s.fetchSubjects);
  const pool = useExamStore((s) => s.questionPool);
  const result = useExamStore((s) => s.result);
  const remaining = useExamStore((s) => s.remainingSeconds);
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
    <div
      data-theme={isDark ? "dark" : "light"}
      className="bg-gray-100 dark:bg-blackText text-blackText dark:text-white min-h-screen w-full flex items-center justify-center"
    >
      <Header isDark={isDark} setIsDark={setIsDark}></Header>
      <div className="p-4 max-w-[1100px] w-full mt-28  relative">
        <div className="flex flex-col md:flex-row gap-6 mb-16 items-center ">
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-4xl md:text-5xl md:max-w-[500px] md:leading-[55px] font-black leading-[42px] bg-gradient-to-r dark:from-primaryGreen dark:via-secondaryBlue dark:to-secondaryGreen from-primaryBlue to-secondaryBlue bg-clip-text text-transparent">
              Wystaw swoje umiejętności na próbe
            </h2>
            <p className="leading-[25px] opacity-75 md:text-lg md:max-w-[400px]">Rozwiąż teorytyczne egzaminy próbne z kwalifikacji <strong className="text-primaryBlue dark:text-primaryGreen">INF 03</strong> , <strong className="text-primaryBlue dark:text-primaryGreen">INF 02</strong> oraz <strong className="text-primaryBlue dark:text-primaryGreen">test maturalny z informatyki</strong> i sprawdź co wymaga powtórki bez zbędnego stresu</p>
          </div>
          <div className="flex-1  items-center justify-center min-h-[180px] hidden md:flex">
           <img src={Biurko} className="w-[30rem]" />
          </div>
        </div>
        {!pool.length && !result ? (
          <ExamSettings />
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
        <Footer isDark={isDark}></Footer>
      </div>
    </div>
  );
}
