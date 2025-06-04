import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import supabase from '../util/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Hls from 'hls.js'

export default function CoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [course, setCourse] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [openSections, setOpenSections] = useState({})

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login-register')
      return
    }

    const fetchCourse = async () => {
      setLoading(true)

      const { data: userData } = await supabase
        .from('users')
        .select('purchased_courses')
        .eq('id', user.id)
        .single()

      if (!userData?.purchased_courses?.includes(id)) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, description')
        .eq('id', id)
        .single()

      setCourse(courseData)

      const { data: videosData } = await supabase
        .from('video_base')
        .select('videoId, title, directUrl, course_id, section_title, order')
        .eq('course_id', id)
        .order('section_title', { ascending: true })
        .order('order', { ascending: true })

      setVideos(videosData)
      setLoading(false)
    }

    fetchCourse()
  }, [id, user, authLoading, navigate])

  const groupVideosBySection = (videos) => {
    return videos.reduce((acc, video) => {
      const section = video.section_title || 'Bez działu'
      if (!acc[section]) acc[section] = []
      acc[section].push(video)
      return acc
    }, {})
  }

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const HlsPlayer = ({ src, title }) => {
    const videoRef = useRef(null)

    useEffect(() => {
      let hls
      if (videoRef.current) {
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = src
        } else if (Hls.isSupported()) {
          hls = new Hls()
          hls.loadSource(src)
          hls.attachMedia(videoRef.current)
        }
      }
      return () => {
        if (hls) {
          hls.destroy()
        }
      }
    }, [src])

    return (
      <video
        ref={videoRef}
        controls
        className="w-full h-full rounded bg-black"
        title={title}
        style={{ objectFit: 'contain', background: 'black' }}
      />
    )
  }

  if (authLoading || loading) return <p>Ładowanie...</p>
  if (error) return <p>Błąd: {error}</p>
  if (accessDenied) return <p>Nie masz dostępu do tego kursu.</p>
  if (!course) return <p>Kurs nie znaleziony.</p>

  const groupedVideos = groupVideosBySection(videos)

  return (
    <div className="p-4 w-full max-w-3xl mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2 text-center">{course.title}</h1>
      <p className="mb-4 text-center">{course.description}</p>
      <h2 className="text-xl font-semibold mb-4">Wideo:</h2>
      {videos.length === 0 && <p>Brak wideo w tym kursie.</p>}

      {Object.entries(groupedVideos).map(([section, vids]) => (
        <div key={section} className="w-full mb-4 border rounded">
          <button
            onClick={() => toggleSection(section)}
            className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 font-semibold text-lg"
          >
            {openSections[section] ? '▼' : '▶'} {section}
          </button>

          {openSections[section] && (
            <div className="p-4 space-y-6">
              {vids.map(video => (
                <div key={video.videoId} className="w-full flex flex-col items-center">
                  <h3 className="font-medium mb-2 text-center">{video.title}</h3>
                  <div className="w-full max-w-2xl aspect-video">
                    <HlsPlayer src={video.directUrl} title={video.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
