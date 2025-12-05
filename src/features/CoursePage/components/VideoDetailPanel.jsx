import { useAuthStore } from '../../../store/authStore';
import useVideoStore from '../../../store/videoStore';
import { ChevronLeft, Check, Clock, FileText, Send, Play, ChevronDown, X, MessageSquare, Download, RefreshCw, Lock, Video as VideoIcon } from "lucide-react";
import { useState } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
import { useToast } from '../../../context/ToastContext';
import supabase from '../../../util/supabaseClient';
import TaskInput from '../../../components/ui/TaskInput';
import TaskTypeBadge from '../../../components/ui/TaskTypeBadge';

export default function VideoDetailPanel({
  video,
  videos,
  selectedSection,
  activeTab,
  onTabChange,
  onVideoSelect,
  onBackToSections,
  HlsPlayer,
  onNavigateToShop,
  setShowSidebar
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskAnswers, setTaskAnswers] = useState({}); // Store answers for each task
  const [expandedTasks, setExpandedTasks] = useState({}); // Track which tasks are expanded
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
      // Refresh feedback after submission
      await fetchTaskAnswers(user.id, courseId, [taskId]);
    } else {
      toast.error(result.message);
    }
    
    setIsSubmitting(false);
  };

  const handleRefreshFeedback = async (taskId) => {
    if (!user) return;

    setIsRefreshing(true);
    try {
      await fetchTaskAnswers(user.id, courseId, [taskId]);
      
      const updatedAnswer = savedTaskAnswers[taskId];
      if (updatedAnswer?.admin_feedback) {
        toast.success('Znaleziono nowy feedback od nauczyciela!');
      } else {
        toast.info('Brak nowego feedbacku');
      }
    } catch (error) {
      console.error('Error refreshing feedback:', error);
      toast.error('Nie udało się odświeżyć feedbacku');
    } finally {
      setIsRefreshing(false);
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

  // Oblicz progress - ile filmów obejrzanych
  const watchedCount = videosInSection.filter(v => userProgress[v.videoId]).length;
  const totalVideos = videosInSection.length;
  const progressText = `${watchedCount}/${totalVideos} rozdziałów`;

  // Sprawdź czy użytkownik ma dostęp do sekcji
  const sectionHasAccess = videosInSection.some(v => hasAccess(v));

  // Funkcja do minimalizacji sidebara przy wyborze filmu
  const handleVideoSelectWithSidebar = (sectionVideo) => {
    if (setShowSidebar) {
      setShowSidebar(false);
    }
    onVideoSelect(sectionVideo);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-white dark:bg-DarkblackText">
      {/* Lewy panel - Lista filmów i zadań */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col h-full flex-shrink-0 bg-white dark:bg-DarkblackText">
        {/* Nagłówek sekcji */}
        <div className="p-4 border-b border-gray-200 dark:border-DarkblackBorder">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={onBackToSections}
              className="flex items-center gap-1 text-secondaryBlue dark:text-secondaryGreen hover:underline cursor-pointer font-medium text-sm"
            >
              <ChevronLeft size={16} />
              <span>Powrót do sekcji</span>
            </button>
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            {selectedSection}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {progressText}
          </p>

          {/* Przyciski Video / Zadania */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => onTabChange('video')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'video'
                  ? 'bg-primaryBlue dark:bg-primaryGreen text-white'
                  : 'bg-gray-100 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => onTabChange('tasks')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'tasks'
                  ? 'bg-primaryBlue dark:bg-primaryGreen text-white'
                  : 'bg-gray-100 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Zadania
            </button>
          </div>

          {/* Przycisk Kup kurs - jeśli brak dostępu */}
          {!sectionHasAccess && (
            <button 
              onClick={onNavigateToShop}
              className="w-full bg-primaryBlue dark:bg-primaryGreen text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Kup kurs
            </button>
          )}
        </div>

        {/* Lista filmów */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {videosInSection.map((sectionVideo, index) => {
            const isSelected = video?.videoId === sectionVideo.videoId;
            const isWatched = !!userProgress[sectionVideo.videoId];
            const videoTasks = allVideoTasks[sectionVideo.videoId] || [];
            const videoHasAccess = hasAccess(sectionVideo);
            
            const videoStats = getVideoStats([sectionVideo.videoId]);
            const stats = videoStats[sectionVideo.videoId] || { total: 0, completed: 0, percentage: 0 };

            return (
              <div
                key={sectionVideo.videoId}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-primaryBlue/10 dark:bg-primaryGreen/20 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-DarkblackBorder/50'
                } ${!videoHasAccess ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => videoHasAccess && handleVideoSelectWithSidebar(sectionVideo)}
              >
                <div className="flex items-start gap-3">
                  {/* Ikona */}
                  <div className={`flex-shrink-0 mt-0.5 ${
                    isSelected 
                      ? 'text-primaryBlue dark:text-primaryGreen' 
                      : videoHasAccess 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-gray-300 dark:text-gray-600'
                  }`}>
                    {videoHasAccess ? (
                      <VideoIcon size={18} strokeWidth={2} />
                    ) : (
                      <Lock size={18} strokeWidth={2} />
                    )}
                  </div>

                  {/* Zawartość */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-medium text-sm leading-tight ${
                        isSelected 
                          ? 'text-primaryBlue dark:text-primaryGreen' 
                          : 'text-gray-900 dark:text-white'
                    }`}>
                      {sectionVideo.title}
                    </h4>
                      {isWatched && videoHasAccess && (
                        <Check size={16} className="flex-shrink-0 text-green-500 dark:text-green-400 mt-0.5" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{sectionVideo.duration || "?"} min</span>
                      </div>
                      {videoTasks.length > 0 && (
                      <div className="flex items-center gap-1">
                          <FileText size={12} />
                        <span>{videoTasks.length} zadań</span>
                      </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prawy panel - Video i zadania */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-DarkblackText">
        {video ? (
          <>
            {/* Nagłówek */}
            <div className="p-4 border-b border-gray-200 dark:border-DarkblackBorder">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {video.title}
                </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                  <Clock size={16} />
                    <span>{video.duration || "?"} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                  <FileText size={16} />
                    <span>{tasks.length} zadań</span>
                </div>
              </div>
            </div>

            {/* Zawartość */}
            <div className="flex-1 overflow-y-auto p-4">
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
                      <div className="mt-4">
                        <h3 className='font-semibold mb-2 text-gray-800 dark:text-white'>{video.video_section_title || video.title}</h3>
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
                  <div>
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
                              className="flex items-center justify-between p-4 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-DarkblackBorder transition-colors"
                              onClick={() => toggleTaskExpansion(task.task_id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-4 mb-1">
                                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                      Zadanie {index + 1}
                                    </h4>
                                    <TaskTypeBadge taskType={task.task_type} />
                                  </div>
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
                                  
                                  {/* Pliki do pobrania */}
                                  {task.file_url && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center gap-2">
                                        <Download size={16} className="text-primaryBlue dark:text-primaryGreen" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          Materiały do zadania:
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleFileDownload(task.file_url, task.file_name || `${task.topic}.pdf`)}
                                        className="mt-2 flex items-center gap-2 px-3 py-2 bg-white dark:bg-DarkblackText border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

                                <div className="space-y-4">
                                  <TaskInput
                                    task={task}
                                    value={currentAnswer}
                                    onChange={(value) => updateTaskAnswer(task.task_id, value)}
                                    disabled={!videoHasAccess || isApproved}
                                  />

                                  {/* Admin Feedback Display */}
                                  {savedAnswer?.admin_feedback && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                      <div className="flex items-start gap-2 mb-2">
                                        <MessageSquare size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                            Feedback od nauczyciela:
                                          </p>
                                          <p className="text-sm text-blue-700 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
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
                                      
                                      {(isSubmitted || isRejected) && (
                                        <button
                                          onClick={() => handleRefreshFeedback(task.task_id)}
                                          disabled={isRefreshing}
                                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all border-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                          title="Sprawdź czy nauczyciel dodał feedback"
                                        >
                                          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                          {isRefreshing ? 'Sprawdzam...' : 'Sprawdź feedback'}
                                        </button>
                                      )}
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
