import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function VideoPanel({
  videos,
  currentVideo,
  setCurrentVideo,
  HlsPlayer,
}) {
  const [selectedSection, setSelectedSection] = useState(null);
  const { id: courseId } = useParams();

  const { user, userProgress, saveVideoProgress } = useAuthStore();

  const groupVideosBySection = (videos) =>
    videos.reduce((acc, video) => {
      const section = video.section_title || "Bez działu";
      if (!acc[section]) acc[section] = [];
      acc[section].push(video);
      return acc;
    }, {});

  const groupedVideos = groupVideosBySection(videos);

  const handleToggleWatched = (videoId, checked) => {
    if (!user) return; 
    saveVideoProgress(user.id, videoId, checked);
  };

  return (
    <div className="w-full">
      {!selectedSection ? (
        <div className="grid md:grid-cols-4 grid-cols-0 grid-rows-4 md:grid-rows-1 gap-6 w-full md:min-h-[96vh]">
          {Object.keys(groupedVideos).map((section) => {
            const videosInSection = groupedVideos[section];
            const watchedCount = videosInSection.filter(
              (v) => userProgress[v.videoId]
            ).length;

            return (
              <div
                key={section}
                onClick={() => setSelectedSection(section)}
                className="bg-white dark:bg-DarkblackBorder p-4 md:p-8 flex flex-col items-start justify-center w-full rounded-[12px] shadow cursor-pointer transition-all duration-200 hover:bg-secondaryBlue/20 dark:hover:bg-DarkblackText"
              >
                <h3 className="text-lg md:text-2xl font-semibold mb-1 md:mb-2">{section}</h3>

                <div className="mt-2 w-full">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-secondaryBlue dark:bg-secondaryGreen h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (watchedCount / videosInSection.length) * 100 || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm md:text-md text-blackText/50 dark:text-white/50 mt-3">
                    {Math.round(
                      (watchedCount / videosInSection.length) * 100
                    ) || 0}
                    % ukończono
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row-reverse gap-6 w-full bg-white dark:bg-DarkblackBorder min-h-[96vh] rounded-[12px] p-5">
          <div className="w-full space-y-4">
            <button
              onClick={() => {
                setSelectedSection(null);
                setCurrentVideo(null);
              }}
              className="flex items-center gap-1 text-secondaryBlue dark:text-secondaryGreen hover:underline cursor-pointer"
            >
              <ChevronLeft size={18} /> Wróć do listy działów
            </button>

            <h3 className="text-xl font-bold mb-4">{selectedSection}</h3>

            <ul className="space-y-3">
              {groupedVideos[selectedSection].map((video, index) => {
                const isWatched = !!userProgress[video.videoId];

                return (
                  <li
                    key={video.videoId}
                    className={`p-3 rounded-lg border border-gray-200 dark:border-DarkblackText dark:bg-DarkblackText shadow-sm ${
                      currentVideo?.videoId === video.videoId
                        ? "bg-secondaryBlue/25 dark:bg-DarkblackBorder font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-blackText/75"
                    }`}
                    onClick={() => setCurrentVideo(video)}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div className="cursor-pointer w-full">
                        <span className="text-md">
                          {index + 1}. {video.title}
                        </span>
                        <div className="text-sm text-blackText/50 dark:text-white/50">
                          {video.duration || "?"} min
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isWatched}
                        onChange={(e) =>
                          handleToggleWatched(video.videoId, e.target.checked)
                        }
                        title="Oznacz jako obejrzany"
                        className="ml-2 h-5 w-5"
                        onClick={(e) => e.stopPropagation()} 
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {currentVideo && (
            <div className="w-full">
              <div className="aspect-video w-full max-w-full rounded overflow-hidden shadow">
                <HlsPlayer
                  src={currentVideo.directUrl}
                  title={currentVideo.title}
                />
              </div>
              <h4 className="text-lg mt-2">
                <span className="text-blackText/75 dark:text-white/75 mr-1 font-semibold">Tytuł:</span>
                {currentVideo.title}
              </h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
