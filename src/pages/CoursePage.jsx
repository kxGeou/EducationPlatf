import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import supabase from '../util/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function CoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [course, setCourse] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login-register')
      return
    }

    const fetchCourse = async () => {
      setLoading(true)
      // Check if user has access to this course
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('purchased_courses')
        .eq('id', user.id)
        .single()
      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }
      if (!userData?.purchased_courses?.includes(id)) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      // Fetch course info
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title, description')
        .eq('id', id)
        .single()
      if (courseError) {
        setError(courseError.message)
        setLoading(false)
        return
      }
      setCourse(courseData)

      // Fetch videos for this course
      const { data: videosData, error: videosError } = await supabase
        .from('video_base')
        .select('videoId, title, directUrl, course_id')
        .eq('course_id', id) 

      if (videosError) setError(videosError.message)
      else setVideos(videosData)
      setLoading(false)
    }
    
    fetchCourse()
  }, [id, user, authLoading, navigate])

  if (authLoading || loading) return <p>Ładowanie...</p>
  if (error) return <p>Błąd: {error}</p>
  if (accessDenied) return <p>Nie masz dostępu do tego kursu.</p>
  if (!course) return <p>Kurs nie znaleziony.</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <p className="mb-4">{course.description}</p>
      <h2 className="text-xl font-semibold mb-2">Wideo:</h2>
      <ul>
        {videos.length === 0 && <li>Brak wideo w tym kursie.</li>}
        {videos.map(video => (
          <li key={video.videoId} className="mb-4">
            <h3 className="font-medium">{video.title}</h3>
            <iframe
              src={video.directUrl}
              className="w-full rounded"
              allowFullScreen
              title={video.title}
              height={360}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}