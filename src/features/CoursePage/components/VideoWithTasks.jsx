import { useAuthStore } from '../../../store/authStore';
import { ChevronLeft, Check, Clock, FileText, Send, Upload, MessageSquare, Download } from "lucide-react";
import { useState, useEffect } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
import supabase from '../../../util/supabaseClient';
import { useToast } from '../../../context/ToastContext';
import TaskInput from '../../../components/ui/TaskInput';
import TaskTypeBadge from '../../../components/ui/TaskTypeBadge';

export default function VideoWithTasks({
  video,
  setActiveSection,
  HlsPlayer
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskAnswers, setTaskAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  
  const toast = useToast();
  const { id: courseId } = useParams();
  const { user, userProgress, saveVideoProgress, purchasedCourses } = useAuthStore();

  // Pobierz zadania dla danego filmu
  useEffect(() => {
    const fetchTasks = async () => {
      if (!video?.videoId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('course_id', courseId)
          .eq('video_id', video.videoId)
          .order('task_id', { ascending: true });

        if (error) throw error;

        setTasks(data || []);
        
        // Pobierz już przesłane odpowiedzi
        if (user) {
          const { data: answers, error: answersError } = await supabase
            .from('video_tasks_answers')
            .select('task_id, answer, status, admin_feedback, feedback_date')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .in('task_id', (data || []).map(task => task.task_id.toString()));

          if (!answersError && answers) {
            const submittedTaskIds = answers.map(answer => answer.task_id);
            setSubmittedTasks(submittedTaskIds);
            
            // Zapisz odpowiedzi wraz z feedbackiem
            const answersMap = {};
            answers.forEach(answer => {
              answersMap[answer.task_id] = answer;
            });
            setSubmittedAnswers(answersMap);
          }
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        toast.error('Nie udało się załadować zadań');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [video, courseId, user, toast]);

  const handleToggleWatched = async (videoId, checked) => {
    if (!user) return;
    saveVideoProgress(user.id, videoId, checked, courseId);
  };

  const handleAnswerChange = (taskId, answer) => {
    setTaskAnswers(prev => ({
      ...prev,
      [taskId]: answer
    }));
  };

  const handleSubmitAnswer = async (taskId) => {
    const answer = taskAnswers[taskId];
    if (!answer || !answer.trim()) {
      toast.error('Proszę wprowadzić odpowiedź');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Musisz być zalogowany');
        return;
      }

      // Sprawdź czy odpowiedź już istnieje
      const { data: existingAnswer, error: checkError } = await supabase
        .from('video_tasks_answers')
        .select('id')
        .eq('task_id', taskId.toString())
        .eq('user_id', user.id)
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
        toast.success('Odpowiedź została zaktualizowana');
      } else {
        // Dodaj nową odpowiedź
        const { error: insertError } = await supabase
          .from('video_tasks_answers')
          .insert({
            task_id: taskId.toString(),
            user_id: user.id,
            course_id: courseId,
            answer: answer.trim(),
            status: 'pending'
          });

        if (insertError) throw insertError;
        setSubmittedTasks(prev => [...prev, taskId.toString()]);
        toast.success('Odpowiedź została przesłana do sprawdzenia');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Wystąpił błąd podczas przesyłania odpowiedzi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle file download
  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      // If it's a direct URL, create a temporary link to download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'plik_zadania.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Rozpoczęto pobieranie pliku');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Nie udało się pobrać pliku');
    }
  };

  const isWatched = !!userProgress[video?.videoId];
  const hasAccess = !video?.section_id || purchasedCourses.includes(video.section_id);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 w-full min-h-[96vh] p-3">
        {/* Nagłówek z przyciskiem powrotu */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setActiveSection("video")}
            className="flex items-center gap-2 text-secondaryBlue dark:text-secondaryGreen hover:underline cursor-pointer font-medium text-sm lg:text-base"
          >
            <ChevronLeft size={18} className="lg:w-5 lg:h-5" />
            Powrót do listy filmów
          </button>
        </div>

        {video && (
          <>
            {/* Video Player */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {video.title}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={16} />
                    <span>{video.duration || "?"} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText size={16} />
                    <span>{tasks.length} zadań</span>
                  </div>
                </div>
              </div>

              {!hasAccess ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg relative bg-black flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold mb-2">Film zablokowany</h3>
                    <p className="text-sm opacity-80">
                      Ten film wymaga zakupu pakietu. Przejdź do sekcji Sklep, aby kupić dostęp.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg relative bg-black">
                  <HlsPlayer
                    src={video.directUrl}
                    title={video.title}
                  />
                </div>
              )}

              {/* Checkbox do oznaczania jako obejrzany */}
              {hasAccess && (
                <div className="flex items-center gap-3 mt-4 p-3 bg-white dark:bg-DarkblackText rounded-lg shadow-sm">
                  <input
                    type="checkbox"
                    id="watched"
                    checked={isWatched}
                    onChange={(e) => handleToggleWatched(video.videoId, e.target.checked)}
                    className="h-5 w-5 cursor-pointer text-blue-600 rounded"
                  />
                  <label htmlFor="watched" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Oznacz jako obejrzany
                  </label>
                </div>
              )}

              {/* Opis filmu */}
              {video.video_description && (
                <div className="mt-4 p-4 bg-white dark:bg-DarkblackText rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {video.video_description}
                  </p>
                </div>
              )}
            </div>

            {/* Zadania */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Zadania ({tasks.length})
              </h3>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primaryBlue dark:border-primaryGreen mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ładowanie zadań...</p>
                  </div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Brak zadań
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Do tego filmu nie zostały przypisane żadne zadania.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task, index) => {
                    const isSubmitted = submittedTasks.includes(task.task_id.toString());
                    const currentAnswer = taskAnswers[task.task_id] || '';

                    return (
                      <div key={task.task_id} className="bg-white dark:bg-DarkblackText rounded-lg shadow-sm p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              Zadanie {index + 1}
                            </h4>
                            <TaskTypeBadge taskType={task.task_type} />
                          </div>
                          {isSubmitted && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Check size={16} />
                              <span className="text-sm font-medium">Przesłane</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {task.topic}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {task.task}
                          </p>
                          
                          {/* Pliki do pobrania */}
                          {task.file_url && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 mb-2">
                                <Download size={16} className="text-primaryBlue dark:text-primaryGreen" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Materiały do zadania:
                                </span>
                              </div>
                              <button
                                onClick={() => handleFileDownload(task.file_url, task.file_name || `${task.topic}.pdf`)}
                                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-DarkblackText border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <FileText size={14} className="text-primaryBlue dark:text-primaryGreen" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {task.file_name || 'Pobierz plik PDF'}
                                </span>
                                <Download size={14} className="text-gray-500 dark:text-gray-400" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <TaskInput
                            task={task}
                            value={currentAnswer}
                            onChange={(value) => handleAnswerChange(task.task_id, value)}
                            disabled={!hasAccess}
                          />

                          {/* Admin Feedback Display */}
                          {isSubmitted && submittedAnswers[task.task_id.toString()]?.admin_feedback && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <div className="flex items-start gap-2 mb-2">
                                <MessageSquare size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                    Feedback od nauczyciela:
                                  </p>
                                  <p className="text-sm text-blue-700 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
                                    {submittedAnswers[task.task_id.toString()].admin_feedback}
                                  </p>
                                  {submittedAnswers[task.task_id.toString()].feedback_date && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                      {new Date(submittedAnswers[task.task_id.toString()].feedback_date).toLocaleDateString('pl-PL', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {hasAccess && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleSubmitAnswer(task.task_id)}
                                disabled={!currentAnswer.trim() || isSubmitting}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                  currentAnswer.trim() && !isSubmitting
                                    ? 'bg-primaryBlue dark:bg-primaryGreen text-white hover:opacity-90'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                <Send size={16} />
                                {isSubmitting ? 'Przesyłanie...' : isSubmitted ? 'Zaktualizuj odpowiedź' : 'Prześlij odpowiedź'}
                              </button>
                            </div>
                          )}

                          {!hasAccess && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                🔒 Dostęp do zadań wymaga zakupu pakietu kursu.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}







