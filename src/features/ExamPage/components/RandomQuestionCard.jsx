import { useExamStore } from '../../../store/examStore';

export default function RandomQuestionCard({ isDark }) {
  const currentRandomQuestion = useExamStore((s) => s.currentRandomQuestion);
  const randomQuestionAnswer = useExamStore((s) => s.randomQuestionAnswer);
  const randomQuestionCorrect = useExamStore((s) => s.randomQuestionCorrect);
  const currentCourseId = useExamStore((s) => s.currentCourseId);
  const answerRandomQuestion = useExamStore((s) => s.answerRandomQuestion);
  const getNewRandomQuestion = useExamStore((s) => s.getNewRandomQuestion);
  const exitRandomQuestionMode = useExamStore((s) => s.exitRandomQuestionMode);
  const courses = useExamStore((s) => s.courses);

  if (!currentRandomQuestion) return null;

  const getChoiceStyle = (choice) => {
    if (!randomQuestionAnswer) {
      return "border-gray-200 bg-white dark:bg-DarkblackText dark:text-white hover:border-primaryBlue dark:hover:border-primaryGreen hover:shadow-md";
    }
    
    if (choice.is_correct) {
      return "text-white bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600 shadow-lg";
    }
    
    if (randomQuestionAnswer.id === choice.id && !choice.is_correct) {
      return "text-white bg-red-500 dark:bg-red-600 border-red-500 dark:border-red-600 shadow-lg";
    }
    
    return "border-gray-200 bg-white dark:bg-DarkblackText dark:text-white opacity-50";
  };

  const getSubjectTitle = () => {
    const course = courses.find(c => c.id === currentCourseId);
    return course ? course.title : "Losowe Pytanie";
  };

  return (
    <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-DarkblackText">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r dark:from-primaryGreen dark:via-secondaryBlue dark:to-secondaryGreen from-primaryBlue via-secondaryBlue to-primaryBlue bg-clip-text text-transparent mb-2">
            {getSubjectTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Odpowiedz na pytanie i sprawdź swoją wiedzę
          </p>
        </div>
        <button
          onClick={exitRandomQuestionMode}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
        >
          ← Powrót
        </button>
      </div>
      
      <div className="bg-gradient-to-r from-primaryBlue/5 to-secondaryBlue/5 dark:from-primaryGreen/5 dark:to-secondaryBlue/5 rounded-xl p-6 mb-8">
        <h3 className="font-bold text-xl dark:text-white text-blackText leading-relaxed">
          {currentRandomQuestion.prompt}
        </h3>
      </div>
      
      <div className="space-y-4">
        {currentRandomQuestion.choices?.map((choice, index) => {
          // Handle different choice formats from the new exam_question structure
          const choiceId = choice.id || choice.choiceId || index;
          const choiceLabel = choice.label || choice.option || String.fromCharCode(65 + index); // A, B, C, D
          const choiceText = choice.text || choice.content || choice.option || choice;
          const isCorrect = choice.is_correct || choice.isCorrect || false;
          
          return (
            <label
              key={choiceId}
              className={`flex items-center transition-all duration-200 p-4 rounded-xl cursor-pointer border-2 ${getChoiceStyle({ id: choiceId, is_correct: isCorrect })}`}
            >
              <input
                type="radio"
                checked={randomQuestionAnswer?.id === choiceId}
                onChange={() => answerRandomQuestion({ id: choiceId, is_correct: isCorrect })}
                disabled={!!randomQuestionAnswer}
                className="mr-4 accent-primaryBlue dark:accent-primaryGreen disabled:opacity-50 w-5 h-5"
              />
              <span className="font-semibold mr-3 text-lg">{choiceLabel}.</span>
              <span className="text-base">{choiceText}</span>
            </label>
          );
        })}
      </div>

      {randomQuestionAnswer && (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-DarkblackText dark:to-DarkblackBorder border border-gray-200 dark:border-DarkblackText">
          <div className={`text-center mb-6 ${randomQuestionCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <div className="text-4xl mb-4">
              {randomQuestionCorrect ? '✓' : '✗'}
            </div>
            <h4 className="text-xl font-bold mb-3">
              {randomQuestionCorrect ? 'Poprawnie!' : 'Niepoprawnie'}
            </h4>
            <p className="text-base opacity-80">
              {randomQuestionCorrect 
                ? 'Świetna robota! Odpowiedziałeś poprawnie.' 
                : 'Nie tym razem. Kontynuuj ćwiczenia!'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => getNewRandomQuestion()}
              className="px-6 py-4 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryGreen text-white font-semibold text-lg rounded-xl hover:shadow-xl hover:-translate-y-1 duration-300 transition-all cursor-pointer"
            >
              Nowe Pytanie
            </button>
            <button
              onClick={exitRandomQuestionMode}
              className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-xl hover:shadow-xl hover:-translate-y-1 duration-300 transition-all cursor-pointer"
            >
              Powrót
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
