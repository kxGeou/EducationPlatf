import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useAuthStore } from "../../store/authStore"

export default function ChartPanel({ course, videos = [] }) {
  const { userProgress, userFlashcards } = useAuthStore()

  const totalVideos = videos.length
  const watchedVideos = videos.filter(
    (video) => userProgress?.[video.videoId] === true
  ).length

  const flashcardsArray = Object.entries(userFlashcards).map(
    ([flashcard_id, status]) => ({
      flashcard_id,
      status,
    })
  )

  const totalFlashcards = flashcardsArray.length
  const reviewedStatuses = ["seen", "known"]
  const reviewedFlashcards = flashcardsArray.filter((f) =>
    reviewedStatuses.includes(f.status)
  ).length

  const data = [
    { name: "Obejrzane filmy", value: watchedVideos },
    { name: "Nieobejrzane filmy", value: totalVideos - watchedVideos },
    { name: "Przerobione fiszki", value: reviewedFlashcards },
    { name: "Nieprzerobione fiszki", value: totalFlashcards - reviewedFlashcards },
  ]

  return (
    <div className="w-full bg-white dark:bg-DarkblackBorder rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-bold mb-6 text-blackText dark:text-white">
        Twój postęp nauki
      </h2>

      <div className="w-full h-[300px] sm:h-[84.5vh]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fill: "#888" }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "#888", fontSize: 14 }}
              width={140}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
