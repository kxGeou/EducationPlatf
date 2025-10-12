import { useAuthStore } from "../../../store/authStore";
import useVideoStore from "../../../store/videoStore";
import {
  ChevronLeft,
  Clock,
  FileText,
  Play,
  Lock,
  CheckCircle,
  Circle,
} from "lucide-react";
import React from "react";

export default function VideoListPanel({
  videos,
  selectedSection,
  onVideoSelect,
  onBackToSections,
}) {
  const { userProgress, purchasedCourses } = useAuthStore();
  const { videoTasks, taskAnswers, loading, getVideoStats } = useVideoStore();

  // Filtruj filmy według wybranej sekcji
  const videosInSection = selectedSection
    ? videos.filter((v) => v.section_title === selectedSection)
    : [];

  // Pobierz statystyki zadań
  const videoStats = getVideoStats(videosInSection.map((v) => v.videoId));

  const hasAccess = (video) => {
    return !video?.section_id || purchasedCourses.includes(video.section_id);
  };

  const getProgressPercentage = (videoId) => {
    const stats = videoStats[videoId];
    return stats ? stats.percentage : 0;
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue dark:border-primaryGreen mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Ładowanie filmów...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="w-full ">
        <div className="p-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBackToSections}
              className="flex items-center gap-2 text-secondaryBlue dark:text-secondaryGreen  cursor-pointer font-medium text-base"
            >
              <ChevronLeft size={18} />
              Powrót do sekcji
            </button>
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {selectedSection}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {videosInSection.length} filmów w sekcji
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videosInSection.map((video, index) => {
              const isWatched = !!userProgress[video.videoId];
              const videoHasAccess = hasAccess(video);
              const stats = videoStats[video.videoId] || {
                total: 0,
                completed: 0,
                percentage: 0,
              };

              return (
                <div
                  key={video.videoId}
                  className={`p-4 rounded-lg cursor-pointer transition-all border ${
                    videoHasAccess
                      ? "bg-white hover:bg-gray-50 dark:hover:bg-DarkblackText border-gray-200 dark:bg-DarkblackText dark:border-DarkblackText shadow-sm hover:shadow-md"
                      : "bg-gray-100 border-gray-100 opacity-75"
                  }`}
                  onClick={() => videoHasAccess && onVideoSelect(video)}
                >
                  <div className="flex flex-col space-y-3 justify-between">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white flex-1 pr-2 leading-tight">
                          {video.title}
                        </h4>
                        {!videoHasAccess && (
                          <Lock
                            size={14}
                            className="text-gray-500 flex-shrink-0"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{video.duration || "?"} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={12} />
                          <span>{stats.total} zadań</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {isWatched && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle size={12} />
                          <span className="text-xs font-medium">Obejrzany</span>
                        </div>
                      )}

                      {videoHasAccess && (
                        <div className="flex items-center gap-1 text-primaryBlue dark:text-primaryGreen">
                          <Play size={12} />
                          <span className="text-xs font-medium">Otwórz</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
