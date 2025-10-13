import { useAuthStore } from '../../../store/authStore';
import useVideoStore from '../../../store/videoStore';
import { ChevronLeft, Check, Clock, FileText, Send, Play, BookOpen, ChevronDown, ChevronUp, X, MessageSquare } from "lucide-react";
import { useState } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
import { useToast } from '../../../context/ToastContext';
import supabase from '../../../util/supabaseClient';

export default function VideoDetailPanel({
  video,
  videos,
  selectedSection,
  activeTab,
  onTabChange,
  onVideoSelect,
  onBackToSections,
  HlsPlayer
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskAnswers, setTaskAnswers] = useState({}); // Store answers for each task
  const [expandedTasks, setExpandedTasks] = useState({}); // Track which tasks are expanded
  
  const toast = useToast();
  const { id: courseId } = useParams();
  const { user, userProgress, saveVideoProgress, purchasedCourses } = useAuthStore();
  
  const { videoTasks: allVideoTasks, taskAnswers: savedTaskAnswers, loading, submitTaskAnswer, fetchVideoTasks, fetchTaskAnswers, getVideoStats } = useVideoStore();

  const tasks = video ? (allVideoTasks[video.videoId] || []) : [];

  const handleToggleWatched = async (videoId, checked) => {
    if (!user) return;
    saveVideoProgress(user.id, videoId, checked, courseId);
    
    if (checked) {
      try {
        const { data: existingReview, error } = await supabase
          .from('video_reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .single();

        if (error && error.code === 'PGRST116') { 
          if (window.showReviewModal) {
            window.showReviewModal(videoId, video.title);
          }
        }
      } catch (err) {
        console.error('Error checking existing review:', err);
      }
    }
  };

  // Function to toggle task expansion
  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Function to update answer for specific task
  const updateTaskAnswer = (taskId, answer) => {
    setTaskAnswers(prev => ({
      ...prev,
      [taskId]: answer
    }));
  };

  // Function to get answer for specific task
  const getTaskAnswer = (taskId) => {
    return taskAnswers[taskId] || '';
  };

  const handleSubmitAnswer = async (taskId) => {
    const currentAnswer = getTaskAnswer(taskId);
    
    if (!currentAnswer || !currentAnswer.trim()) {
      toast.error('Proszę wprowadzić odpowiedź');
      return;
    }

    if (!user) {
      toast.error('Musisz być zalogowany');
      return;
    }

    setIsSubmitting(true);
    
    const result = await submitTaskAnswer(taskId, user.id, courseId, currentAnswer);
    
    if (result.success) {
      toast.success(result.message);
      // Don't clear the answer after successful submission - keep it for editing
    } else {
      toast.error(result.message);
    }
    
    setIsSubmitting(false);
  };

  const hasAccess = (video) => {
    return !video?.section_id || purchasedCourses.includes(video.section_id);
  };

  const isWatched = !!userProgress[video?.videoId];
  const videoHasAccess = hasAccess(video);

  // Filtruj filmy według wybranej sekcji
  const videosInSection = selectedSection ? 
    videos.filter(v => v.section_title === selectedSection) : 
    [];

  // Pobierz zadania dla wszystkich filmów w sekcji przy załadowaniu (tylko raz)
  React.useEffect(() => {
    let isMounted = true;
    
    const loadTasksForSection = async () => {
      if (videosInSection.length > 0 && courseId && isMounted) {
        try {
          const videoIds = videosInSection.map(v => v.videoId);
          await fetchVideoTasks(courseId, videoIds);
        } catch (error) {
          console.error('Error loading tasks:', error);
        }
      }
    };

    loadTasksForSection();
    
    return () => {
      isMounted = false;
    };
  }, [selectedSection, courseId]); // Usunięto fetchVideoTasks z dependencies

  // Load existing answers when tasks change
  React.useEffect(() => {
    if (tasks.length > 0) {
      const existingAnswers = {};
      tasks.forEach(task => {
        const savedAnswer = savedTaskAnswers[task.task_id];
        if (savedAnswer) {
          existingAnswers[task.task_id] = savedAnswer.answer || '';
        }
      });
      setTaskAnswers(existingAnswers);
    }
  }, [tasks, savedTaskAnswers]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-2 lg:gap-4">
      {/* Lewy panel - Lista filmów i zadań */}
      <div className="w-full lg:w-64 xl:w-72 2xl:w-80 flex flex-col h-64 lg:h-full  flex-shrink-0">
        {/* Nagłówek sekcji */}
        <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={onBackToSections}
              className="flex items-center gap-1 text-secondaryBlue dark:text-secondaryGreen hover:underline cursor-pointer font-medium text-xs lg:text-sm"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Powrót do sekcji</span>
              <span className="sm:hidden">Powrót</span>
            </button>
          </div>
          <h2 className="text-sm lg:text-base font-bold text-gray-800 dark:text-white truncate">
            {selectedSection}
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {videosInSection.length} filmów
          </p>
        </div>

        {/* Lista filmów */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-3 space-y-2">
          {videosInSection.map((sectionVideo, index) => {
            const isSelected = video?.videoId === sectionVideo.videoId;
            const isWatched = !!userProgress[sectionVideo.videoId];
            const videoTasks = allVideoTasks[sectionVideo.videoId] || [];
            const videoHasAccess = hasAccess(sectionVideo);
            
            const videoStats = getVideoStats([sectionVideo.videoId]);
            const stats = videoStats[sectionVideo.videoId] || { total: 0, completed: 0, percentage: 0 };
            const allTasksCompleted = stats.total > 0 && stats.completed === stats.total;

            return (
              <div
                key={sectionVideo.videoId}
                className={`p-2 lg:p-3 rounded-lg cursor-pointer border-gray-100 transition-all border dark:border-DarkblackText ${
                  isSelected 
                    ? ' dark:border-primaryGreen/75 bg-primaryBlue text-white  dark:bg-DarkblackText' 
                    : 'bg-white dark:bg-DarkblackText '
                }`}
                onClick={() => onVideoSelect(sectionVideo)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-xs lg:text-sm mb-2 leading-tight ${
                      isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {sectionVideo.title}
                    </h4>
                    
                    <div className={`flex items-center gap-2 lg:gap-3 text-xs mb-1 ${
                      isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>{sectionVideo.duration || "?"} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={10} />
                        <span>{videoTasks.length} zadań</span>
                      </div>
                    </div>

                  </div>

                  <div className="flex items-center justify-center">
            
                    {videoHasAccess && (
                      <div className="flex items-center gap-3 mt-6 ">
                        <input
                          type="checkbox"
                          id="watched"
                          checked={isWatched}
                          onChange={(e) => handleToggleWatched(video.videoId, e.target.checked)}
                          className="h-5 w-5 cursor-pointer text-blue-600 rounded"
                        />
                      
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prawy panel - Video i zadania */}
      <div className="flex-1 flex flex-col h-full lg:h-full min-w-0 bg-white rounded-lg max-h-[97vh] dark:bg-DarkblackText p-4">
        {video ? (
          <>
            {/* Nagłówek z zakładkami */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0 mb-4 ">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h2 className="text-base lg:text-lg font-bold text-gray-800 dark:text-white truncate">
                  {video.title}
                </h2>
                <div className="flex items-center gap-3 lg:gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{video.duration || "?"} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>{tasks.length} zadań</span>
                  </div>
                </div>
                
              </div>

              <div className="flex bg-gray-100 dark:bg-DarkblackBorder rounded-lg p-1 w-full lg:w-auto">
                <button
                  onClick={() => onTabChange('video')}
                  className={`flex items-center justify-center gap-1 lg:gap-2 flex-1 lg:flex-none px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'video'
                      ? 'bg-white dark:bg-DarkblackText text-primaryBlue dark:text-primaryGreen shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Play size={14} />
                  <span>Film</span>
                </button>
                <button
                  onClick={() => onTabChange('tasks')}
                  className={`flex items-center justify-center gap-1 lg:gap-2 flex-1 lg:flex-none px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'tasks'
                      ? 'bg-white dark:bg-DarkblackText text-primaryBlue dark:text-primaryGreen shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>Zadania ({tasks.length})</span>
                </button>
              </div>
            </div>

            {/* Zawartość */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'video' ? (
                /* Panel z filmem */
                <div className="space-y-4">
                  {/* Video Player */}
                  <div className="w-full">
                    {!videoHasAccess ? (
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

                    

                    {/* Opis filmu */}
                    {video.video_description && (
                      <div className="mt-4 p-4 bg-white dark:bg-DarkblackText rounded-lg ">
                        <h2 className='font-semibold mb-1'>{video.video_section_title}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {video.video_description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Panel z zadaniami */
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-3 bg-white dark:border-DarkblackBorder dark:bg-DarkblackText">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                      Zadania do filmu: {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rozwiąż zadania związane z obejrzanym materiałem.
                    </p>
                  </div>

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
                    <div className="space-y-6">
                      {tasks.map((task, index) => {
                        const savedAnswer = savedTaskAnswers[task.task_id];
                        const isSubmitted = savedAnswer && savedAnswer.status === 'pending';
                        const isApproved = savedAnswer && savedAnswer.status === 'approved';
                        const isRejected = savedAnswer && savedAnswer.status === 'rejected';
                        const isExpanded = expandedTasks[task.task_id];
                        const currentAnswer = getTaskAnswer(task.task_id);

                        // Get status styling
                        const getStatusInfo = () => {
                          if (isApproved) {
                            return {
                              text: 'Zaakceptowane',
                              color: 'text-green-600 dark:text-green-400',
                              bgColor: 'bg-green-50 dark:bg-green-900/20',
                              borderColor: 'border-green-200 dark:border-green-800',
                              icon: <Check size={16} className="text-green-600 dark:text-green-400" />
                            };
                          }
                          if (isRejected) {
                            return {
                              text: 'Odrzucone',
                              color: 'text-red-600 dark:text-red-400',
                              bgColor: 'bg-red-50 dark:bg-red-900/20',
                              borderColor: 'border-red-200 dark:border-red-800',
                              icon: <X size={16} className="text-red-600 dark:text-red-400" />
                            };
                          }
                          if (isSubmitted) {
                            return {
                              text: 'W oczekiwaniu',
                              color: 'text-yellow-600 dark:text-yellow-400',
                              bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                              borderColor: 'border-yellow-200 dark:border-yellow-800',
                              icon: <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                            };
                          }
                          return null;
                        };

                        const statusInfo = getStatusInfo();

                        return (
                          <div key={task.task_id} className="w-full">
                            {/* Task Header - Clickable */}
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer border border-gray-100 shadow-sm rounded-lg dark:border-DarkblackBorder "
                              onClick={() => toggleTaskExpansion(task.task_id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                  <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                    Zadanie {index + 1}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                    {task.topic}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {currentAnswer.trim() && !isApproved && !isRejected && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Masz niezapisane zmiany"></div>
                                )}
                                
                                {statusInfo && (
                                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                                    {statusInfo.icon}
                                    <span className={statusInfo.color}>{statusInfo.text}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Task Content - Expandable */}
                            {isExpanded && (
                              <div className="mt-4 space-y-4">
                                <div className="p-4 bg-primaryBlue/10 dark:bg-DarkblackBorder rounded-lg">
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {task.topic}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {task.task}
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <label htmlFor={`answer-${task.task_id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Twoja odpowiedź:
                                    </label>
                                    <textarea
                                      id={`answer-${task.task_id}`}
                                      value={currentAnswer}
                                      onChange={(e) => updateTaskAnswer(task.task_id, e.target.value)}
                                      placeholder="Wprowadź swoją odpowiedź..."
                                      className="w-full p-3 border-0 bg-primaryBlue/10 rounded-lg dark:bg-DarkblackBorder resize-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
                                      rows={4}
                                      disabled={!videoHasAccess || isApproved}
                                    />
                                  </div>

                                  {/* Admin Feedback Section */}
                                  {savedAnswer?.admin_feedback && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                      <div className="flex items-start gap-3">
                                        <MessageSquare size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                          <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                            Feedback od nauczyciela
                                          </h5>
                                          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">
                                            {savedAnswer.admin_feedback}
                                          </p>
                                          {savedAnswer.feedback_date && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                              {new Date(savedAnswer.feedback_date).toLocaleDateString('pl-PL', {
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

                                  {videoHasAccess && !isApproved && (
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

                                  {!videoHasAccess && (
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        🔒 Dostęp do zadań wymaga zakupu pakietu kursu.
                                      </p>
                                    </div>
                                  )}

                                  {isApproved && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Check size={16} className="text-green-600 dark:text-green-400" />
                                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                          Odpowiedź została zaakceptowana! Zadanie ukończone.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {isRejected && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <X size={16} className="text-red-600 dark:text-red-400" />
                                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                          Odpowiedź została odrzucona. Możesz poprawić i ponownie przesłać.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                Wybierz film
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Kliknij na film z lewej strony, aby zobaczyć video i zadania.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
