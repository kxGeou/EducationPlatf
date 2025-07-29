import UserHeader from "../components/userPage/UserHeader"
import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Loading from "../components/systemLayouts/Loading"
import Error from "../components/systemLayouts/Error"
import { useAuthStore } from "../store/authStore"
import { useSingleCourseStore } from "../store/singleCourseStore"
import Hls from "hls.js"

export default function CoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuthStore()
  const {
    fetchCourseById,
    course,
    videos,
    loading,
    error,
    accessDenied
  } = useSingleCourseStore()

  const [currentVideo, setCurrentVideo] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [userDataModal, setUserDataModal] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) navigate("/authentication")
    if (user) fetchCourseById(id)
  }, [authLoading, user, id])

  useEffect(() => {
    if (videos.length > 0) {
      setCurrentVideo(videos[0])
    }
  }, [videos])

  const groupVideosBySection = (videos) => {
    return videos.reduce((acc, video) => {
      const section = video.section_title || "Bez działu"
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
        if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = src
        } else if (Hls.isSupported()) {
          hls = new Hls()
          hls.loadSource(src)
          hls.attachMedia(videoRef.current)
        }
      }
      return () => {
        if (hls) hls.destroy()
      }
    }, [src])

    return (
      <video
        ref={videoRef}
        controls
        className="w-full h-full rounded bg-black"
        title={title}
        style={{ objectFit: "contain" }}
      />
    )
  }

  if (authLoading || loading) return <Loading />
  if (accessDenied || error) return <Error />
  if (!course) return <Error />
  if (videos.length === 0)
    return <p className="p-6">Brak wideo w tym kursie.</p>

  const groupedVideos = groupVideosBySection(videos)

  return (
    <div className="min-h-screen bg-slate-100">
      <UserHeader
        userDataModal={userDataModal}
        setUserDataModal={setUserDataModal}
      />

      <div className="flex flex-col-reverse md:flex-row min-h-[calc(100vh-4rem)]">
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-white p-4 overflow-y-auto max-h-[50vh] md:max-h-none lg:m-4 rounded-[12px] shadow-lg">
          <h2 className="text-2xl font-bold mb-1">{course.title}</h2>
          <p className="text-md text-gray-500 mb-4">{course.description}</p>

          {Object.entries(groupedVideos).map(
            ([section, vids], sectionIndex) => (
              <div key={section} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {section}
                </h3>

                <ul className="space-y-2">
                  {vids.map((video, i) => {
                    const absoluteIndex = videos.findIndex(
                      (v) => v.videoId === video.videoId
                    )
                    const isCurrent = currentVideo?.videoId === video.videoId
                    const isFree =
                      video?.isFree ||
                      absoluteIndex === 0 ||
                      absoluteIndex === 1 ||
                      absoluteIndex === 3
                    const duration =
                      video.duration || Math.floor(Math.random() * 10 + 1)

                    return (
                      <li
                        key={video.videoId}
                        onClick={() => setCurrentVideo(video)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                          isCurrent
                            ? "bg-blue-100 font-semibold"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">
                            {absoluteIndex}
                          </span>
                          <span className="text-sm">{video.title}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-xs">
                          <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                            {duration} min
                          </span>
                          {isFree && (
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded">
                              FREE
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          )}
        </aside>

        <main className="flex flex-col w-full items-start p-6">
          {currentVideo ? (
            <div className="flex flex-col w-full items-start justify-start ">
              <h3 className="text-2xl font-bold mb-4 w-full ">
                {currentVideo.title}
              </h3>
              <div className="aspect-video w-full max-w-[1300px] rounded overflow-hidden shadow">
                <HlsPlayer
                  src={currentVideo.directUrl}
                  title={currentVideo.title}
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Wybierz lekcję z listy poniżej.
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
