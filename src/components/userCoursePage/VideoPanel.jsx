import { useAuthStore } from "../../store/authStore";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function VideoPanel({
  videos,
  currentVideo,
  setCurrentVideo,
  HlsPlayer,
}) {
  const [selectedSection, setSelectedSection] = useState(null);
  const { id: courseId } = useParams();
  const { user, userProgress, saveVideoProgress } = useAuthStore();

  const groupedVideos = videos.reduce((acc, video) => {
    const section = video.section_title || "Bez działu";
    if (!acc[section]) acc[section] = [];
    acc[section].push(video);
    return acc;
  }, {});

  const handleToggleWatched = (videoId, checked) => {
    if (!user) return;
    saveVideoProgress(user.id, videoId, checked);
  };

  return (
    <div className="w-full  h-full  md:overflow-y-auto ">
      {!selectedSection ? (
        <div className="flex flex-col gap-8 w-full  md:min-h-[96vh] md:py-5">
          <h3 className="text-2xl font-bold text-blackText  dark:text-white">
            Lekcje video
          </h3>

          <div className="md:grid flex flex-col grid-cols-2 grid-rows-2 gap-8">
            {Object.keys(groupedVideos).map((section) => {
              const videosInSection = groupedVideos[section];
              const watchedCount = videosInSection.filter(
                (v) => userProgress[v.videoId]
              ).length;

              return (
                <div
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className="bg-white dark:bg-DarkblackBorder p-8 flex flex-col items-start justify-center w-full rounded-[12px] shadow cursor-pointer transition-all duration-200 hover:shadow-lg  dark:hover:bg-DarkblackText"
                >
                  <h3 className="text-2xl font-semibold mb-2">{section}</h3>
                  <p className="w-full max-w-[75%] font-semibold opacity-50">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Delectus libero iure doloremque illum eligendi expedita
                    voluptates sunt harum ut corporis.
                  </p>
                  <div className="mt-2 w-full">
                    <p className="text-md mb-2 text-blackText/50 dark:text-white/50 mt-3">
                      {Math.round(
                        (watchedCount / videosInSection.length) * 100
                      ) || 0}
                      % ukończono
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-secondaryBlue dark:bg-secondaryGreen h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (watchedCount / videosInSection.length) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row-reverse gap-6 w-full min-h-[96vh] rounded-[12px] p-5">
          <div className="w-full space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedSection(null);
                  setCurrentVideo(null);
                }}
                className="flex items-center gap-1 text-secondaryBlue dark:text-secondaryGreen hover:underline cursor-pointer font-medium"
              >
                <ChevronLeft size={30} />
              </button>

              <h3 className="text-2xl font-bold">{selectedSection}</h3>
            </div>

            <ul className="space-y-3 ">
              {groupedVideos[selectedSection].map((video, index) => {
                const isWatched = !!userProgress[video.videoId];
                return (
                  <li
                    key={video.videoId}
                    className={`p-4 rounded-lg border bg-white border-gray-200 dark:border-DarkblackText dark:bg-DarkblackText shadow-sm transition-all duration-200 cursor-pointer ${
                      currentVideo?.videoId === video.videoId
                        ? "bg-secondaryBlue/25 dark:bg-DarkblackBorder font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-blackText/75"
                    }`}
                    onClick={() => setCurrentVideo(video)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 w-full">
                        <span className="text-md font-medium">
                          {index + 1}. {video.title}
                        </span>
                        <p className="text-sm text-blackText/50 dark:text-white/50">
                          {video.duration || "?"} min
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={isWatched}
                        onChange={(e) =>
                          handleToggleWatched(video.videoId, e.target.checked)
                        }
                        title="Oznacz jako obejrzany"
                        className="h-5 w-5 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {currentVideo && (
            <div className="w-full space-y-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
                <HlsPlayer
                  src={currentVideo.directUrl}
                  title={currentVideo.title}
                />
              </div>

              {console.log(currentVideo)}

              <div className="bg-white dark:bg-DarkblackBorder p-5 rounded-xl shadow space-y-3">
                <h4 className="text-xl font-bold">{currentVideo.title}</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {currentVideo.video_description}
                </p>
                <img src={currentVideo.video_section_image} />
                <h4 className="text-xl font-bold">
                  {currentVideo.video_section_title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {currentVideo.video_section_description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
