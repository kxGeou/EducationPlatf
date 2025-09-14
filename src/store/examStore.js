import {create} from "zustand";
import supabase from "../util/supabaseClient";

export const useExamStore = create((set, get) => ({
  subjects: [],
  questionPool: [],
  answers: {}, // { [questionId]: { choiceId, isCorrect } }
  examId: null,
  result: null,
  loading: false,
  // Random question mode
  randomQuestionMode: false,
  currentRandomQuestion: null,
  randomQuestionAnswer: null,
  randomQuestionCorrect: null,
  currentSubjectId: null,

  fetchSubjects: async () => {
    const { data, error } = await supabase.from("subjects").select("*");
    if (error) console.error(error);
    set({ subjects: data || [] });
  },

    startTimer: () => {
    const interval = setInterval(() => {
      set((s) => {
        if (s.remainingSeconds <= 1) {
          clearInterval(interval);
          get().finishExam();
          return { remainingSeconds: 0 };
        }
        return { remainingSeconds: s.remainingSeconds - 1 };
      });
    }, 1000);
  },


  startExam: async ({ subjectId, numQuestions = 10 }) => {
    set({ loading: true, remainingSeconds: 60 * 60 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }

    const { data: exam } = await supabase
      .from("exams")
      .insert([{ user_id: user.id, subject_id: subjectId, num_questions: numQuestions }])
      .select()
      .single();

    const { data: questions } = await supabase
      .from("questions")
      .select("id,prompt,choices(id,label,text,is_correct)")
      .eq("subject_id", subjectId);

    if (!questions || questions.length === 0) { set({ loading: false }); return; }

    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, numQuestions);

    set({ questionPool: shuffled, answers: {}, examId: exam.id, result: null, loading: false, remainingSeconds: 60 * 60 });

    // start timer
    get().startTimer();
  },


  answerQuestion: (question, choice) =>
    set((s) => ({
      answers: {
        ...s.answers,
        [question.id]: { choiceId: choice.id, isCorrect: choice.is_correct },
      },
    })),

  finishExam: async () => {
    const { examId, answers, questionPool } = get();

    const payload = Object.entries(answers).map(([qid, ans]) => ({
      exam_id: examId,
      question_id: qid,
      selected_choice_id: ans.choiceId,
      is_correct: ans.isCorrect,
    }));

    await supabase.from("exam_answers").insert(payload);

    const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
    const score = (correctCount / questionPool.length) * 100;

    await supabase
      .from("exams")
      .update({ finished_at: new Date().toISOString(), score })
      .eq("id", examId);

    set({ result: { correctCount, total: questionPool.length, score } });
  },

  // Random question methods
  startRandomQuestionMode: async (subjectId) => {
    set({ loading: true, randomQuestionMode: true });

    const { data: questions } = await supabase
      .from("questions")
      .select("id,prompt,choices(id,label,text,is_correct)")
      .eq("subject_id", subjectId);

    if (!questions || questions.length === 0) { 
      set({ loading: false, randomQuestionMode: false }); 
      return; 
    }

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    set({ 
      currentRandomQuestion: randomQuestion, 
      randomQuestionAnswer: null,
      randomQuestionCorrect: null,
      currentSubjectId: subjectId,
      loading: false 
    });
  },

  answerRandomQuestion: (choice) => {
    set((s) => ({
      randomQuestionAnswer: choice,
      randomQuestionCorrect: choice.is_correct,
    }));
  },

  getNewRandomQuestion: async () => {
    const { currentSubjectId } = get();
    if (!currentSubjectId) return;

    const { data: questions } = await supabase
      .from("questions")
      .select("id,prompt,choices(id,label,text,is_correct)")
      .eq("subject_id", currentSubjectId);

    if (!questions || questions.length === 0) return;

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    set({ 
      currentRandomQuestion: randomQuestion, 
      randomQuestionAnswer: null,
      randomQuestionCorrect: null,
    });
  },

  exitRandomQuestionMode: () => {
    set({ 
      randomQuestionMode: false,
      currentRandomQuestion: null,
      randomQuestionAnswer: null,
      randomQuestionCorrect: null,
      currentSubjectId: null,
    });
  },
}));
