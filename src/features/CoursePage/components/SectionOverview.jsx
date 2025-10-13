import { useAuthStore } from '../../../store/authStore';
import { ChevronLeft, Clock, FileText, Play, Lock, Users } from "lucide-react";
import { useState, useEffect } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
import supabase from '../../../util/supabaseClient';

export default function SectionOverview({
  videos,
  setActiveSection,
  onSelectSection
}) {
  const [videoTasks, setVideoTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const { id: courseId } = useParams();
  const { user, userProgress, purchasedCourses } = useAuthStore();

  const groupedVideos = videos.reduce((acc, video) => {
    const section = video.section_title || "Bez działu";
    if (!acc[section]) acc[section] = [];
    acc[section].push(video);
    return acc;
  }, {});

  const sortedSections = Object.keys(groupedVideos).sort();

  useEffect(() => {
    const fetchVideoTasks = async () => {
      if (!videos.length) return;
      
      setLoading(true);
      const tasksCount = {};
      
      for (const video of videos) {
        try {
          const { data, error } = await supabase
            .from('video_tasks')
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

  const hasAccess = (sectionId) => {
    return purchasedCourses.includes(sectionId);
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-teal-500 to-teal-600'
    ];
    return gradients[index % gradients.length];
  };

  const handleSectionSelect = (section) => {
    onSelectSection(section);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue dark:border-primaryGreen mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Ładowanie sekcji...</p>
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
            const hasAccessToSection = hasAccess(sectionId);
            
            // Policz zadania w sekcji
            const totalTasks = videosInSection.reduce((sum, video) => {
              return sum + (videoTasks[video.videoId] || 0);
            }, 0);

            return (
              <div
                key={section}
                className={`w-full h-80 rounded-[12px] overflow-hidden shadow-lg transition-all duration-200 ${
                  hasAccessToSection ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                onClick={() => {
                  if (hasAccessToSection) {
                    handleSectionSelect(section);
                  }
                }}
              >
                {/* Section card */}
                <div className={`flex flex-col h-full transition-all duration-200 ${
                  hasAccessToSection 
                    ? 'bg-white dark:bg-DarkblackText shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-800 shadow-md opacity-75'
                }`}>
                  {/* Top gradient with title */}
                  <div className={`w-full h-12 bg-gradient-to-r ${getRandomGradient(sectionIndex)} flex items-center justify-center`}>
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">{section}</h3>
                  </div>
                  
                  <div className="flex-1 p-4 flex flex-col">
                    {videosInSection[0]?.section_description && (
                      <p className={`text-sm mb-3 line-clamp-2 flex-1 ${
                        hasAccessToSection ? 'opacity-70' : 'opacity-50'
                      }`}>
                        {videosInSection[0].section_description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className={hasAccessToSection ? 'text-gray-600 dark:text-white' : 'dark:text-white'} />
                        <span className={hasAccessToSection ? 'text-gray-700 dark:text-white' : 'dark:text-white'}>
                          {videosInSection.length} filmów
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText size={14} className={hasAccessToSection ? 'text-gray-600 dark:text-white' : 'dark:text-white'} />
                        <span className={hasAccessToSection ? 'text-gray-700 dark:text-white' : 'dark:text-white'}>
                          {totalTasks} zadań
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs ${
                          hasAccessToSection ? 'text-blackText/50 dark:text-white' : 'dark:text-white '
                        }`}>
                          Postęp
                        </span>
                        <span className={`text-xs font-medium ${
                          hasAccessToSection ? 'text-blackText/70 dark:text-white/70' : 'dark:text-white '
                        }`}>
                          {hasAccessToSection ? Math.round((watchedCount / videosInSection.length) * 100) || 0 : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            hasAccessToSection 
                              ? 'bg-secondaryBlue dark:bg-secondaryGreen' 
                              : 'bg-gray-300 dark:bg-gray-500'
                          }`}
                          style={{
                            width: `${hasAccessToSection ? (watchedCount / videosInSection.length) * 100 || 0 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Button at the bottom */}
                  <div className="p-4 pt-1">
                    {hasAccessToSection ? (
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







