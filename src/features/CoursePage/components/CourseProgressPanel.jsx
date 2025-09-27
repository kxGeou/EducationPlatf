export default function CourseProgressPanel({ course, videos, user }) {
  const viewedVideos = user?.progress?.[course?.id] || []
  const progress = Math.floor((viewedVideos.length / videos.length) * 100) || 0

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{course?.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{course?.description}</p>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-primaryBlue h-3 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-600">{progress}% ukończone</p>
    </div>
  )
}