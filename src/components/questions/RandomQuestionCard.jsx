import { useExamStore } from "../../store/examStore";

export default function RandomQuestionCard({ isDark }) {
  const currentRandomQuestion = useExamStore((s) => s.currentRandomQuestion);
  const randomQuestionAnswer = useExamStore((s) => s.randomQuestionAnswer);
  const randomQuestionCorrect = useExamStore((s) => s.randomQuestionCorrect);
  const currentSubjectId = useExamStore((s) => s.currentSubjectId);
  const answerRandomQuestion = useExamStore((s) => s.answerRandomQuestion);
  const getNewRandomQuestion = useExamStore((s) => s.getNewRandomQuestion);
  const exitRandomQuestionMode = useExamStore((s) => s.exitRandomQuestionMode);
  const subjects = useExamStore((s) => s.subjects);

  if (!currentRandomQuestion) return null;

  const getChoiceStyle = (choice) => {
    if (!randomQuestionAnswer) {
      return "border-gray-200 bg-white dark:bg-DarkblackBorder dark:text-white";
    }
    
    if (choice.is_correct) {
      return "text-white bg-primaryGreen dark:bg-primaryGreen";
    }
    
    if (randomQuestionAnswer.id === choice.id && !choice.is_correct) {
      return "text-white bg-red-500 dark:bg-red-500";
    }
    
    return "border-gray-200 bg-white dark:bg-DarkblackBorder dark:text-white opacity-50";
  };

  const getSubjectTitle = () => {
    const subject = subjects.find(s => s.id === currentSubjectId);
    return subject ? subject.title : "Losowe Pytanie";
  };

  return (
    <div className="mb-16 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r dark:from-primaryGreen dark:via-secondaryBlue dark:to-secondaryGreen from-primaryBlue to-secondaryBlue bg-clip-text text-transparent">
          {getSubjectTitle()}
        </h2>
        <button
          onClick={exitRandomQuestionMode}
          className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen hover:bg-secondaryBlue dark:hover:bg-secondaryGreen cursor-pointer text-white rounded-[12px] transition-colors duration-200"
        >
          Wyjdź z trybu losowego
        </button>
      </div>
      
      <h3 className="font-bold mb-4 text-xl bg-white dark:bg-DarkblackBorder dark:text-white text-blackText p-5 shadow rounded-[12px]">
        {currentRandomQuestion.prompt}
      </h3>
      
      <div className="space-y-3 w-full">
        {currentRandomQuestion.choices?.map((choice) => (
          <label
            key={choice.id}
            className={`flex items-center transition-colors duration-150 p-3 rounded-xl shadow-sm cursor-pointer ${getChoiceStyle(choice)}`}
          >
            <input
              type="radio"
              checked={randomQuestionAnswer?.id === choice.id}
              onChange={() => answerRandomQuestion(choice)}
              disabled={!!randomQuestionAnswer}
              className="mr-3 accent-primaryBlue dark:accent-primaryGreen disabled:opacity-50"
            />
            <span className="font-medium mr-2">{choice.label}.</span>
            <span>{choice.text}</span>
          </label>
        ))}
      </div>

      {randomQuestionAnswer && (
        <div className="mt-6 p-4 rounded-[12px] bg-white dark:bg-DarkblackBorder shadow">
          <div className={`text-center mb-4 ${randomQuestionCorrect ? 'text-primaryGreen dark:text-primaryGreen' : 'text-red-500 dark:text-red-500'}`}>
            <h4 className="text-xl font-bold mb-2">
              {randomQuestionCorrect ? 'Poprawnie!' : 'Niepoprawnie'}
            </h4>
            <p className="text-sm opacity-75">
              {randomQuestionCorrect 
                ? 'Świetna robota! Odpowiedziałeś poprawnie.' 
                : 'Nie tym razem. Kontynuuj ćwiczenia!'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 mt-8 gap-3 justify-center">
            <button
              onClick={() => getNewRandomQuestion()}
              className="md:px-6 py-3 bg-primaryBlue dark:bg-primaryGreen hover:bg-secondaryBlue dark:hover:bg-secondaryGreen text-white rounded-[12px] transition-colors duration-200 font-medium cursor-pointer"
            >
              Nowe Pytanie
            </button>
            <button
              onClick={exitRandomQuestionMode}
              className="cursor-pointer md:px-6 py-3 bg-DarkblackBorder dark:bg-DarkblackText text-white rounded-[12px] transition-colors duration-200 font-medium"
            >
              Powrót
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
