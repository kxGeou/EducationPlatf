import { useExamStore } from "../../store/examStore";

export default function QuestionCard({ q , isDark}) {
  const answerQuestion = useExamStore((s) => s.answerQuestion);
  const answers = useExamStore((s) => s.answers);
  if (!q) return null;

  return (
    <div className="mb-16 w-full">
      <h3 className="font-bold mb-4 text-xl bg-white dark:bg-DarkblackBorder dark:text-white text-blackText p-5 shadow rounded-[12px]">
        {q.prompt}
      </h3>
      <div className="space-y-3 w-full ">
        {q.choices?.map((c) => (
          <label
            key={c.id}
            className={`flex items-center transition-colors duration-150  dark:text-white p-3 rounded-xl shadow-sm cursor-pointer ${
              answers[q.id]?.choiceId === c.id ? "text-white bg-secondaryBlue dark:bg-primaryGreen" : "border-gray-200 bg-white dark:bg-DarkblackBorder"
            }`}
          >
            <input
              type="radio"
              checked={answers[q.id]?.choiceId === c.id}
              onChange={() => answerQuestion(q, c)}
              className="mr-3 accent-primaryBlue dark:accent-primaryGreen"
            />
            <span className="font-medium mr-2 text-blackText dark:text-white ">{c.label}.</span>
            <span>{c.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}