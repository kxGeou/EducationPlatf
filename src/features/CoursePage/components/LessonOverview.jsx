import { useAuthStore } from '../../../store/authStore';
import { ChevronLeft, Clock, FileText, Play, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
import supabase from '../../../util/supabaseClient';

export default function LessonOverview({
  videos,
  setActiveSection,
  onSelectVideo,
  onSelectSection
}) {
  const [videoTasks, setVideoTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const { id: courseId } = useParams();
  const { user, userProgress, purchasedCourses } = useAuthStore();

  useEffect(() => {
    const fetchVideoTasks = async () => {
      if (!videos.length) return;
      
      setLoading(true);
      const tasksCount = {};
      
      for (const video of videos) {
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('task_id')
            .eq('course_id', courseId)
            .eq('video_id', video.videoId);
          
          if (!error && data) {
            tasksCount[video.videoId] = data.length;
          } else {
            tasksCount[video.videoId] = 0;
          }
        } catch (err) {
          console.error('Error fetching tasks for video:', err);
          tasksCount[video.videoId] = 0;
        }
      }
      
      setVideoTasks(tasksCount);
      setLoading(false);
    };

    fetchVideoTasks();
  }, [videos, courseId]);

  const groupedVideos = videos.reduce((acc, video) => {
    const section = video.section_title || "Bez działu";
    if (!acc[section]) acc[section] = [];
    acc[section].push(video);
    return acc;
  }, {});

  // Sortuj sekcje według kolejności (order) z video_base
  const sortedSections = Object.keys(groupedVideos).sort((a, b) => {
    const sectionA = groupedVideos[a][0];
    const sectionB = groupedVideos[b][0];
    const orderA = sectionA?.order || 999;
    const orderB = sectionB?.order || 999;
    return orderA - orderB;
  });

  const hasSectionAccess = (sectionId) => {
    if (!sectionId) return true;
    return purchasedCourses.includes(sectionId);
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'from-blue-300 to-blue-400',
      'from-green-300 to-green-400',
      'from-purple-300 to-purple-400',
      'from-indigo-300 to-indigo-400',
      'from-teal-300 to-teal-400',
      'from-cyan-300 to-cyan-400',
      'from-slate-300 to-slate-400',
      'from-gray-300 to-gray-400'
    ];
    return gradients[index % gradients.length];
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    if (onSelectSection) {
      onSelectSection(section);
    }
  };

  const handleVideoSelect = (video) => {
    onSelectVideo(video);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue dark:border-primaryGreen mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Ładowanie filmów...</p>
        </div>
      </div>
    );
  }

  if (selectedSection) {
    const videosInSection = groupedVideos[selectedSection];
    const sectionId = videosInSection[0]?.section_id;
    const hasAccess = hasSectionAccess(sectionId);

    return (
      <div className="w-full">
        <div className="flex flex-col gap-6 w-full md:min-h-[96vh] p-3">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackToSections}
              className="flex items-center gap-2 text-secondaryBlue dark:text-secondaryGreen hover:underline cursor-pointer font-medium text-sm lg:text-base"
            >
              <ChevronLeft size={18} className="lg:w-5 lg:h-5" />
              Powrót do sekcji
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className={`h-12 bg-gradient-to-r ${getRandomGradient(sortedSections.indexOf(selectedSection))} rounded-lg flex items-center justify-center px-6`}>
              <h2 className="text-white font-bold text-lg drop-shadow-lg">{selectedSection}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{videosInSection.length} filmów</span>
              {videosInSection[0]?.section_description && (
                <span className="max-w-md truncate">{videosInSection[0].section_description}</span>
              )}
            </div>
          </div>

          <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
            Filmy w sekcji
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videosInSection.map((video, videoIndex) => {
              const isWatched = !!userProgress[video.videoId];
              const taskCount = videoTasks[video.videoId] || 0;
              const videoHasAccess = hasAccess;

              return (
                <div
                  key={video.videoId}
                  className={`bg-white dark:bg-DarkblackText rounded-lg shadow-md p-4 transition-all duration-200 ${
                    videoHasAccess ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-75'
                  }`}
                  onClick={() => videoHasAccess && handleVideoSelect(video)}
                >
                  <div className="flex items-start justify-between ">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                          {videoIndex + 1}. {video.title}
                        </span>
                        {!videoHasAccess && <Lock size={14} className="text-gray-500 flex-shrink-0" />}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{video.duration || "?"} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={12} />
                          <span>{taskCount} zadań</span>
                        </div>
                      </div>
                      
                      {video.video_description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {video.video_description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {videoHasAccess ? (
                        <>
                          <div className="flex items-center gap-1">
                            <Play size={14} className="text-primaryBlue dark:text-primaryGreen" />
                            <span className="text-xs text-primaryBlue dark:text-primaryGreen font-medium">Otwórz</span>
                          </div>
                          {isWatched && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Obejrzany"></div>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">🔒</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8 w-full md:min-h-[96vh] p-3">

        <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
          Sekcje kursu
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedSections.map((section, sectionIndex) => {
            const videosInSection = groupedVideos[section];
            const watchedCount = videosInSection.filter(
              (v) => userProgress[v.videoId]
            ).length;
            
            const sectionId = videosInSection[0]?.section_id;
            const hasAccess = hasSectionAccess(sectionId);

            return (
              <div
                key={section}
                className={`w-full h-80 rounded-[12px] overflow-hidden shadow-lg transition-all duration-200 ${
                  hasAccess ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                onClick={() => {
                  if (hasAccess) {
                    handleSectionSelect(section);
                  }
                }}
              >
                <div className={`flex flex-col h-full transition-all duration-200 ${
                  hasAccess 
                    ? 'bg-white dark:bg-DarkblackText shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-800 shadow-md opacity-75'
                }`}>
                  <div className={`w-full h-12 bg-gradient-to-r ${getRandomGradient(sectionIndex)} flex items-center justify-center`}>
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">{section}</h3>
                  </div>
                  
                  <div className="flex-1 p-4 flex flex-col">
                    {videosInSection[0]?.section_description && (
                      <p className={`text-sm mb-3 line-clamp-2 flex-1 ${
                        hasAccess ? 'opacity-70' : 'opacity-50'
                      }`}>
                        {videosInSection[0].section_description}
                      </p>
                    )}
                    
                    <p className={`text-sm mb-3 ${
                      hasAccess ? 'opacity-60' : 'opacity-40'
                    }`}>
                      {videosInSection.length} lekcji wideo
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs ${
                          hasAccess ? 'text-blackText/50 dark:text-white/50' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          Postęp
                        </span>
                        <span className={`text-xs font-medium ${
                          hasAccess ? 'text-blackText/70 dark:text-white/70' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {hasAccess ? Math.round((watchedCount / videosInSection.length) * 100) || 0 : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            hasAccess 
                              ? 'bg-secondaryBlue dark:bg-secondaryGreen' 
                              : 'bg-gray-300 dark:bg-gray-500'
                          }`}
                          style={{
                            width: `${hasAccess ? (watchedCount / videosInSection.length) * 100 || 0 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Przycisk na samym dole - różny w zależności od dostępu */}
                  <div className="p-4 pt-1">
                    {hasAccess ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSectionSelect(section);
                        }}
                        className="w-full py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Play size={14} />
                        Otwórz sekcję
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSection('shop');
                        }}
                        className="w-full py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Lock size={14} />
                        Przejdź do sklepu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
