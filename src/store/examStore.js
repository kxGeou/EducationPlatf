import {create} from "zustand";
import supabase from "../util/supabaseClient";

export const useExamStore = create((set, get) => ({
  courses: [],
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
  currentCourseId: null,

  fetchCourses: async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) console.error(error);
    set({ courses: data || [] });
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


  startExam: async ({ courseId, numQuestions = 10 }) => {
    set({ loading: true, remainingSeconds: 60 * 60 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }

    // Try to create exam record, but don't fail if it doesn't work
    let examId = null;
    try {
      const { data: exam, error } = await supabase
        .from("exams")
        .insert([{ user_id: user.id, course_id: courseId, num_questions: numQuestions }])
        .select()
        .single();
      
      if (error) {
        console.warn('Could not create exam record:', error);
        // Generate a temporary exam ID for the session
        examId = `temp_${Date.now()}`;
      } else {
        examId = exam.id;
      }
    } catch (error) {
      console.warn('Exam table might not exist:', error);
      // Generate a temporary exam ID for the session
      examId = `temp_${Date.now()}`;
    }

    // Fetch questions from the new exam_questions column structure
    const { data: examQuestions } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("course_id", courseId);

    if (!examQuestions || examQuestions.length === 0) { set({ loading: false }); return; }

    // Parse the exam_questions data and convert to the expected format
    const questions = examQuestions.map((eq, index) => {
      // Convert the answers array and correct_answer to the expected choice format
      const choices = eq.answers.map((answer, answerIndex) => ({
        id: answerIndex,
        label: String.fromCharCode(65 + answerIndex), // A, B, C, D
        text: answer,
        is_correct: answer === eq.correct_answer
      }));
      
      return {
        id: eq.id || index,
        prompt: eq.question,
        choices: choices
      };
    });

    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, numQuestions);

    set({ questionPool: shuffled, answers: {}, examId: examId, result: null, loading: false, remainingSeconds: 60 * 60 });

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

    // Only try to save exam results if we have a real exam ID (not temporary)
    if (examId && !examId.startsWith('temp_')) {
      try {
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
      } catch (error) {
        console.warn('Could not save exam results:', error);
      }
    }

    // Calculate results regardless of whether we saved them
    const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
    const score = (correctCount / questionPool.length) * 100;

    set({ result: { correctCount, total: questionPool.length, score } });
  },

  // Random question methods
  startRandomQuestionMode: async (courseId) => {
    set({ loading: true, randomQuestionMode: true });

    // Fetch questions from the new exam_questions column structure
    const { data: examQuestions } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("course_id", courseId);

    if (!examQuestions || examQuestions.length === 0) { 
      set({ loading: false, randomQuestionMode: false }); 
      return; 
    }

    // Parse the exam_questions data and convert to the expected format
    const questions = examQuestions.map((eq, index) => {
      // Convert the answers array and correct_answer to the expected choice format
      const choices = eq.answers.map((answer, answerIndex) => ({
        id: answerIndex,
        label: String.fromCharCode(65 + answerIndex), // A, B, C, D
        text: answer,
        is_correct: answer === eq.correct_answer
      }));
      
      return {
        id: eq.id || index,
        prompt: eq.question,
        choices: choices
      };
    });

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    set({ 
      currentRandomQuestion: randomQuestion, 
      randomQuestionAnswer: null,
      randomQuestionCorrect: null,
      currentCourseId: courseId,
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
    const { currentCourseId } = get();
    if (!currentCourseId) return;

    // Fetch questions from the new exam_questions column structure
    const { data: examQuestions } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("course_id", currentCourseId);

    if (!examQuestions || examQuestions.length === 0) return;

    // Parse the exam_questions data and convert to the expected format
    const questions = examQuestions.map((eq, index) => {
      // Convert the answers array and correct_answer to the expected choice format
      const choices = eq.answers.map((answer, answerIndex) => ({
        id: answerIndex,
        label: String.fromCharCode(65 + answerIndex), // A, B, C, D
        text: answer,
        is_correct: answer === eq.correct_answer
      }));
      
      return {
        id: eq.id || index,
        prompt: eq.question,
        choices: choices
      };
    });

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
