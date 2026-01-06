import { useExamStore } from '../../../store/examStore';

export default function QuestionCard({ q , isDark}) {
  const answerQuestion = useExamStore((s) => s.answerQuestion);
  const answers = useExamStore((s) => s.answers);
  if (!q) return null;

  return (
    <div className="mb-16 w-full">
      <h3 className="font-bold mb-4 text-xl bg-white dark:bg-DarkblackBorder dark:text-white text-blackText p-5 shadow rounded-xl">
        {q.prompt}
      </h3>
      <div className="space-y-3 w-full ">
        {q.choices?.map((c, index) => {
          // Handle different choice formats from the new exam_question structure
          const choiceId = c.id || c.choiceId || index;
          const choiceLabel = c.label || c.option || String.fromCharCode(65 + index); // A, B, C, D
          const choiceText = c.text || c.content || c.option || c;
          const isCorrect = c.is_correct || c.isCorrect || false;
          
          return (
            <label
              key={choiceId}
              className={`flex items-center transition-colors duration-150  dark:text-white p-3 rounded-xl shadow-sm cursor-pointer ${
                answers[q.id]?.choiceId === choiceId ? "text-white bg-secondaryBlue dark:bg-primaryGreen" : "border-gray-200 bg-white dark:bg-DarkblackBorder"
              }`}
            >
              <input
                type="radio"
                checked={answers[q.id]?.choiceId === choiceId}
                onChange={() => answerQuestion(q, { id: choiceId, is_correct: isCorrect })}
                className="mr-3 accent-primaryBlue dark:accent-primaryGreen"
              />
              <span className={`font-medium mr-2 ${
                answers[q.id]?.choiceId === choiceId 
                  ? "text-white" 
                  : "text-blackText dark:text-white"
              }`}>{choiceLabel}.</span>
              <span>{choiceText}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}