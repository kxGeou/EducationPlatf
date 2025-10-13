import { create } from 'zustand';
import supabase from '../util/supabaseClient';

const useVideoStore = create((set, get) => ({
  // Stan
  videos: [],
  videoTasks: {},
  taskAnswers: {},
  loading: false,
  error: null,

  // Akcje dla filmów
  fetchVideos: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('video_base')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (error) throw error;

      set({ videos: data || [], loading: false });
      return data || [];
    } catch (err) {
      console.error('Error fetching videos:', err);
      set({ error: err.message, loading: false });
      return [];
    }
  },

  // Akcje dla zadań
  fetchVideoTasks: async (courseId, videoIds = null) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('video_tasks')
        .select('*')
        .eq('course_id', courseId);

      if (videoIds && videoIds.length > 0) {
        query = query.in('video_id', videoIds);
      }

      const { data, error } = await query
        .order('video_id', { ascending: true })
        .order('task_id', { ascending: true });

      if (error) throw error;

      // Grupuj zadania według video_id
      const tasksByVideo = {};
      (data || []).forEach(task => {
        if (!tasksByVideo[task.video_id]) {
          tasksByVideo[task.video_id] = [];
        }
        tasksByVideo[task.video_id].push(task);
      });

      set({ videoTasks: tasksByVideo, loading: false });
      return tasksByVideo;
    } catch (err) {
      console.error('Error fetching video tasks:', err);
      set({ error: err.message, loading: false });
      return {};
    }
  },

  // Akcje dla odpowiedzi na zadania
  fetchTaskAnswers: async (userId, courseId, taskIds = null) => {
    try {
      let query = supabase
        .from('video_tasks_answers')
        .select('task_id, answer, status')
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (taskIds && taskIds.length > 0) {
        query = query.in('task_id', taskIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Grupuj odpowiedzi według task_id
      const answersByTask = {};
      (data || []).forEach(answer => {
        answersByTask[answer.task_id] = answer;
      });

      set({ taskAnswers: answersByTask });
      return answersByTask;
    } catch (err) {
      console.error('Error fetching task answers:', err);
      set({ error: err.message });
      return {};
    }
  },

  // Submit odpowiedzi na zadanie
  submitTaskAnswer: async (taskId, userId, courseId, answer) => {
    try {
      // Sprawdź czy odpowiedź już istnieje
      const { data: existingAnswer, error: checkError } = await supabase
        .from('video_tasks_answers')
        .select('id')
        .eq('task_id', taskId.toString())
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (existingAnswer) {
        // Aktualizuj istniejącą odpowiedź
        const { error: updateError } = await supabase
          .from('video_tasks_answers')
          .update({
            answer: answer.trim(),
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnswer.id);

        if (updateError) throw updateError;
        
        // Aktualizuj lokalny stan
        set(state => ({
          taskAnswers: {
            ...state.taskAnswers,
            [taskId]: {
              ...state.taskAnswers[taskId],
              answer: answer.trim(),
              status: 'pending'
            }
          }
        }));
        
        return { success: true, message: 'Odpowiedź została zaktualizowana' };
      } else {
        // Dodaj nową odpowiedź
        const { error: insertError } = await supabase
          .from('video_tasks_answers')
          .insert({
            task_id: taskId.toString(),
            user_id: userId,
            course_id: courseId,
            answer: answer.trim(),
            status: 'pending'
          });

        if (insertError) throw insertError;
        
        // Aktualizuj lokalny stan
        set(state => ({
          taskAnswers: {
            ...state.taskAnswers,
            [taskId]: {
              task_id: taskId,
              answer: answer.trim(),
              status: 'pending'
            }
          }
        }));
        
        return { success: true, message: 'Odpowiedź została przesłana do sprawdzenia' };
      }
    } catch (error) {
      console.error('Error submitting task answer:', error);
      return { success: false, message: error.message };
    }
  },

  // Pobierz statystyki zadań dla filmów
  getVideoStats: (videoIds) => {
    const { videoTasks, taskAnswers } = get();
    const stats = {};
    
    videoIds.forEach(videoId => {
      const tasks = videoTasks[videoId] || [];
      let completed = 0;
      
      tasks.forEach(task => {
        const answer = taskAnswers[task.task_id];
        if (answer && answer.status === 'approved') {
          completed++;
        }
      });
      
      stats[videoId] = {
        total: tasks.length,
        completed: completed,
        percentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
      };
    });
    
    return stats;
  },

  // Reset stanu
  reset: () => {
    set({
      videos: [],
      videoTasks: {},
      taskAnswers: {},
      loading: false,
      error: null
    });
  }
}));

export default useVideoStore;







