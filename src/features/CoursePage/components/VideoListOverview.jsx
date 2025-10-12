import { useAuthStore } from '../../../store/authStore';
import { ChevronLeft, Clock, FileText, Play, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
import supabase from '../../../util/supabaseClient';

export default function VideoListOverview({
  videos,
  setActiveSection,
  onSelectVideo
}) {
  const [videoTasks, setVideoTasks] = useState({});
  const [loading, setLoading] = useState(true);
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

  const hasAccess = (video) => {
    if (!video?.section_id) return true;
    return purchasedCourses.includes(video.section_id);
  };

  const handleVideoSelect = (video) => {
    onSelectVideo(video);
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

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8 w-full md:min-h-[96vh] p-3">
        <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
          Wszystkie filmy w kursie
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video, index) => {
            const isWatched = !!userProgress[video.videoId];
            const taskCount = videoTasks[video.videoId] || 0;
            const videoHasAccess = hasAccess(video);

            return (
              <div
                key={video.videoId}
                className={`bg-white dark:bg-DarkblackText rounded-lg shadow-md p-4 transition-all duration-200 ${
                  videoHasAccess ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-75'
                }`}
                onClick={() => videoHasAccess && handleVideoSelect(video)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {video.title}
                      </span>
                      {!videoHasAccess && <Lock size={14} className="text-gray-500 flex-shrink-0" />}
                    </div>
                    
                    {video.section_title && (
                      <p className="text-xs text-primaryBlue dark:text-primaryGreen font-medium mb-2">
                        {video.section_title}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
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
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
                        {video.video_description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
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






