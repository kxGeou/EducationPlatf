import { useEffect, useState } from "react"
import  supabase  from "../util/supabaseClient"
import { useAuthStore } from "../store/authStore"

export function useVideoProgress(courseId) {
  const { user } = useAuthStore()
  const [watchedVideos, setWatchedVideos] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !courseId) return
    fetchProgress()
  }, [user, courseId])

  const fetchProgress = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("user_video_progress")
      .select("video_id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("watched", true)

    if (!error && data) {
      setWatchedVideos(new Set(data.map((row) => row.video_id)))
    }
    setLoading(false)
  }

  const toggleWatched = async (videoId, isWatched) => {
    const { error } = await supabase
      .from("user_video_progress")
      .upsert({
        user_id: user.id,
        course_id: courseId,
        video_id: videoId,
        watched: isWatched,
      })

    if (!error) {
      setWatchedVideos((prev) => {
        const updated = new Set(prev)
        if (isWatched) updated.add(videoId)
        else updated.delete(videoId)
        return updated
      })
    }
  }

  return {
    watchedVideos,
    loading,
    toggleWatched,
  }
}
