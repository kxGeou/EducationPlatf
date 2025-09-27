import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { useAuthStore } from '../../../store/authStore';
import { BarChart3, TrendingUp, Target } from "lucide-react"
import { useMemo } from "react"

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
  const knownFlashcards = flashcardsArray.filter((f) => f.status === "known").length
  const unknownFlashcards = flashcardsArray.filter((f) => f.status === "unknown").length

  // Video progress data
  const videoData = [
    { name: "Obejrzane filmy", value: watchedVideos },
    { name: "Nieobejrzane filmy", value: totalVideos - watchedVideos },
  ]

  // Flashcard pie chart data
  const flashcardPieData = [
    { name: "Opanowane", value: knownFlashcards, color: "#10B981" },
    { name: "Do nauki", value: unknownFlashcards, color: "#EF4444" },
  ]

  // Overall progress data
  const overallProgressData = [
    { name: "Filmy", completed: watchedVideos, total: totalVideos },
    { name: "Fiszki", completed: knownFlashcards, total: totalFlashcards },
  ]

  return (
    <div className="w-full h-full rounded-[12px] p-3">
      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
        <BarChart3 size={20} />
        Statystyki i postęp
      </span>

      <div className="space-y-6">
        {/* Overall Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Progress */}
          <div className="bg-white dark:bg-DarkblackText border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-blue-500" size={20} />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Postęp wideo</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Obejrzane</span>
                <span className="text-lg font-semibold text-green-600">{watchedVideos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pozostałe</span>
                <span className="text-lg font-semibold text-red-600">{totalVideos - watchedVideos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Łącznie</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalVideos}</span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Postęp:</span>
                  <span className="font-semibold">{totalVideos ? Math.round((watchedVideos / totalVideos) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalVideos ? (watchedVideos / totalVideos) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard Progress */}
          <div className="bg-white dark:bg-DarkblackText border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-purple-500" size={20} />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Postęp fiszek</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Opanowane</span>
                <span className="text-lg font-semibold text-green-600">{knownFlashcards}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Do nauki</span>
                <span className="text-lg font-semibold text-red-600">{unknownFlashcards}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Łącznie</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalFlashcards}</span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Postęp:</span>
                  <span className="font-semibold">{totalFlashcards ? Math.round((knownFlashcards / totalFlashcards) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalFlashcards ? (knownFlashcards / totalFlashcards) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Progress Bar Chart */}
          <div className="bg-white dark:bg-DarkblackText border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-indigo-500" size={20} />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Postęp wideo</h4>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={videoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`${value} filmów`, '']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: '#f9fafb', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Flashcard Pie Chart */}
          <div className="bg-white dark:bg-DarkblackText border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-purple-500" size={20} />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Rozkład fiszek</h4>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flashcardPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {flashcardPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} fiszek`, '']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: '#f9fafb', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Opanowane ({knownFlashcards})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Do nauki ({unknownFlashcards})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Comparison */}
        <div className="bg-white dark:bg-DarkblackText border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-500" size={20} />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Porównanie postępu</h4>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} ${name === 'completed' ? 'ukończonych' : 'łącznie'}`,
                    name === 'completed' ? 'Ukończone' : 'Łącznie'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
