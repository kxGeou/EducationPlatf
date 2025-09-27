export default function VideoSectionList({
  videos,
  currentVideo,
  setCurrentVideo,
  isDark,
}) {
  const groupVideosBySection = (videos) =>
    videos.reduce((acc, video) => {
      const section = video.section_title || "Bez działu"
      if (!acc[section]) acc[section] = []
      acc[section].push(video)
      return acc
    }, {})

  const groupedVideos = groupVideosBySection(videos)

  return (
    <div>
      {Object.entries(groupedVideos).map(([section, vids]) => (
        <div key={section} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/75 mb-2">{section}</h3>
          <ul className="space-y-2">
            {vids.map((video, index) => {
              const isCurrent = currentVideo?.videoId === video.videoId
              return (
                <li
                  key={video.videoId}
                  onClick={() => setCurrentVideo(video)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                    isCurrent
                      ? "bg-blue-100 font-semibold dark:bg-DarkblackBorder"
                      : "hover:bg-gray-100 dark:hover:bg-blackText"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-primaryBlue text-white text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm">{video.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{video.duration || "?"} min</span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
