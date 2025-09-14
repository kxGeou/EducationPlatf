import { useExamStore } from "../../store/examStore";

export default function ResultView() {
  const res = useExamStore((s) => s.result);
  const pool = useExamStore((s) => s.questionPool);
  const answers = useExamStore((s) => s.answers);

  if (!res) return null;

  const passed = res.score >= 75;

  return (
    <div className="mt-6 bg-gray-100 dark:bg-blackText flex flex-col items-center justify-center min-h-[80vh] w-full">
      <div className="flex flex-col items-center justify-center mb-10 w-full">
        <div
          className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-2xl md:text-4xl font-bold shadow-lg mb-4 border-4 ${
            passed
              ? "dark:bg-blackText bg-white  border-primaryGreen text-primaryGreen animate-bounce"
              : "dark:bg-blackText bg-white border-red-500 text-red-500 animate-bounce"
          }`}
        >
          {Math.round(res.score)}%
        </div>
        <h3 className={`font-bold text-xl md:text-2xl mb-2 ${passed ? "text-primaryGreen" : "text-red-500"}`}>
          {passed ? "Zdałeś egzamin!" : "Niestety nie zdałeś"}
        </h3>
        <p className="md:text-lg mb-2 text-gray-700 dark:text-gray-200">
          Wynik: <span className="font-bold">{res.correctCount}/{res.total}</span> poprawnych odpowiedzi
        </p>
        {passed ? (
          <span className="w-full max-w-[300px] text-center py-3 md:py-4 mt-6 cursor-pointer bg-primaryGreen text-white rounded-[12px] font-semibold shadow" onClick={() => document.location.reload()}>Gratulacje!</span>
        ) : (
          <span className="w-full max-w-[300px] text-center py-3 md:py-4 mt-6 cursor-pointer bg-red-500 text-white rounded-[12px] font-semibold shadow" onClick={() => document.location.reload()}>Spróbuj ponownie!</span>
        )}
      </div>
      <div className="flex flex-col gap-16 w-full ">
        {pool.map((q) => {
          const userAns = answers[q.id];
          const correctChoice = q.choices.find((c) => c.is_correct);
          return (
            <div key={q.id} className="flex flex-col gap-3">
              <h4 className="font-semibold mb-2 bg-primaryBlue dark:bg-primaryGreen text-white p-4 rounded-[12px]">
                {q.prompt}
              </h4>
              {q.choices.map((c) => {
                const isUser = userAns?.choiceId === c.id;
                const isCorrect = c.is_correct;
                return (
                  <div
                    key={c.id}
                    className={`p-3 md:p-4 rounded-[12px] transition-all duration-200 ${
                      isCorrect
                        ? "border-2 border-primaryGreen  text-primaryGreen"
                        : isUser && !isCorrect
                        ? "border-2 border-red-500  text-red-500"
                        : " rounded-[12px] shadow-sm border border-gray-200 dark:bg-DarkblackBorder dark:border-DarkblackText"
                    }`}
                  >
                    <span className="font-bold mr-2">{c.label}.</span> {c.text}
                    {isUser && !isCorrect && (
                      <span className="ml-2 text-red-600 font-bold">(Twoja odpowiedź)</span>
                    )}
                    {isCorrect && (
                      <span className="ml-2 text-primaryGreen font-bold">(Poprawna)</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}