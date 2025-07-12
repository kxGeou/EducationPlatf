import LandingHeader from "../components/coursePage/LandingHeader";
import { useAuth } from "../context/AuthContext";
import supabase from "../util/supabaseClient";
import Hls from "hls.js";
import { ArrowDown01, ArrowDown01Icon, Check, ChevronDown, ChevronRight, MonitorPlay, ScreenShareIcon, TrophyIcon, Video } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from '../components/homepage/Footer';
export default function CourseLandingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [firstVideo, setFirstVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyBought, setAlreadyBought] = useState(false);
  const hasFetchedRef = useRef(false);
  const [videos, setVideos] = useState([]);
const [otherCourses, setOtherCourses] = useState([]); 
  useEffect(() => {
    if (!user || hasFetchedRef.current) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: courseData } = await supabase
        .from("courses")
        .select("id, title, description, price_cents")
        .eq("id", id)
        .single();

      setCourse(courseData);

      const { data: videosData } = await supabase
        .from("video_base")
        .select("videoId, title, section_title")
        .eq("course_id", id)
        .order("section_title", { ascending: true })
        .order("order", { ascending: true });

      setVideos(videosData || []);
      setFirstVideo(videosData?.[0] || null);
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("purchased_courses")
          .eq("id", user.id)
          .single();

        if (userData?.purchased_courses?.includes(id)) {
          setAlreadyBought(true);
        }
      }

       const { data: otherCoursesData } = await supabase
        .from("courses")
        .select("id, title, description")
        .neq("id", id)
        .limit(4);

      setOtherCourses(otherCoursesData || []);

      setLoading(false);
      hasFetchedRef.current = true;
    };


    fetchData();
  }, [id, user]);

  const handleBuy = async () => {
    if (!user) {
      alert("Musisz być zalogowany, żeby kupić kurs.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Brak sesji. Zaloguj się ponownie.");
      return;
    }

    const priceCents = course.price_cents * 100;
    if (!priceCents || isNaN(priceCents) || priceCents < 200) {
      alert("Cena kursu musi wynosić co najmniej 2 zł.");
      return;
    }

    const res = await fetch(
      "https://gkvjdemszxjmtxvxlnmr.supabase.co/functions/v1/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          course_id: course.id,
          course_title: course.title,
          price_cents: priceCents,
          success_url_base: window.location.origin,
        }),
      }
    );

    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      console.error("Błąd przy tworzeniu sesji płatności:", data);
      alert("Coś poszło nie tak. Spróbuj ponownie.");
    }
  };

  if (loading) return <p className="p-4">Ładowanie...</p>;
  if (!course) return <p className="p-4 text-red-500">Kurs nie znaleziony.</p>;

  const learn = [
    "Programować w wybranym języku",
    "Pisać się zaawansowane skrypty",
    "Doświadczenie do dalszej przygody z programowaniem",
    "Zaznajomienie się z najnowszymi technologiami",
  ];



  return (
    <div className="w-full flex flex-col items-center">
      <LandingHeader></LandingHeader>
      <section className="bg-darkBlue flex justify-center text-white px-4 py-8 w-full relative">
        <div className="max-w-[1100px] w-full min-h-[10rem] flex justify-between items-start ">
        <div>
           <h1 className="text-3xl font-semibold mb-2 md:text-4xl">{course.title}</h1> 
           <p className="opacity-75 mb-6 md:text-lg">{course.description}</p>

          {!alreadyBought && (
            <button
              onClick={handleBuy}
              className="px-4 py-2 bg-secondaryGreen text-white cursor-pointer rounded-lg transition-all duration-300 hover:scale-105"
            >
              Kup kurs za {course.price_cents} zł
            </button>
          )}

          {alreadyBought && (
            <p className="text-secondaryGreen font-semibold">
              Posiadasz ten kurs
            </p>
          )}
        </div>
        
        </div>
      </section>

      <main className="w-full max-w-[1100px] px-4 md:px-0">


        <section className="border p-4 mt-16 border-gray-400 md:py-6 rounded">
          <h2 className="text-xl font-bold md:text-2xl">Czego się nauczysz</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 items-start mt-2 md:mt-4">
            {learn.map((l, index) => (
              <li className="flex gap-2 items-center text-gray-800" key={index}>
                <Check size={18} className="text-secondaryGreen"></Check> {l}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col my-16">
          <h2 className="text-xl font-bold mb-4 md:text-2xl">Ten kurs obejmuje:</h2>

          <ul className="flex flex-col gap-2 md:gap-3">
            <span className="text-gray-800 flex items-center gap-2">
              <Video size={18} className="text-secondaryBlue"></Video>
              12 godz. treści video
            </span>
            <span className="text-gray-800 flex items-center gap-2 ">
              <ScreenShareIcon
                size={18}
                className="text-secondaryBlue"
              ></ScreenShareIcon>
              Dostęp na urządzeniach mobilnych i desktopowych
            </span>
            <span className="text-gray-800 flex items-center gap-2 ">
              <TrophyIcon size={18} className="text-secondaryBlue"></TrophyIcon>
              Certyfikat po kursie
            </span>
            <span className="text-gray-800 flex items-center gap-2 ">
              <ArrowDown01Icon size={18} className="text-secondaryBlue"></ArrowDown01Icon>
              {videos.length} Filmów Video
            </span>
          </ul>
        </section>

        <section className="flex flex-col my-16">
          <h2 className="text-xl font-bold mb-4 md:text-2xl">Treść kursu</h2>
          <CourseSections videos={videos} firstVideoId={firstVideo?.videoId} />
        </section>



        <section className="my-16">
          <h2 className="text-xl font-bold mb-4 md:text-2xl">Inne kursy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherCourses.length === 0 && <p>Brak innych kursów.</p>}
            {otherCourses.map(({ id: cId, title, description }) => (
              <div
                key={cId}
                className="cursor-pointer transition duration-300 rounded-md py-4 shadow-md hover:shadow-lg hover:scale-102"
                onClick={() => navigate(`/course/${cId}`)}
              >
                <div className="w-full h-30 flex items-center rounded-t-lg justify-center bg-darkBlue text-white">prototyp</div>
                <div className="p-2 mt-1">
                  <h3 className="font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-gray-700">{description}</p>
                </div>

              </div>
            ))}
          </div>
        </section>


      </main>

      <Footer></Footer>
    </div>
  );
}

function HlsPlayer({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;
    if (videoRef.current) {
      if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = src;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
      }
    }
    return () => hls?.destroy();
  }, [src]);

  return (
    <video ref={videoRef} controls className="w-full h-full bg-black rounded" />
  );
}

function CourseSections({ videos, firstVideoId }) {
  const [openSections, setOpenSections] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);

  const groupedVideos = videos.reduce((acc, video) => {
    const section = video.section_title || "Bez działu";
    if (!acc[section]) acc[section] = [];
    acc[section].push(video);
    return acc;
  }, {});

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  return (
    <div className="rounded">
{Object.entries(groupedVideos).map(([section, vids], idx) => (
  <div key={section} >
    <button
      onClick={() => toggleSection(section)}
      className={`w-full text-left font-semibold  text-md  flex justify-between items-center px-4 py-4 ${
        openSections[section] ? "bg-gray-100/90 border border-gray-300" : "bg-gray-100/90  border border-gray-300"
      }`}
    >
      {section}
      <span>
        {openSections[section] ? <ChevronDown /> : <ChevronRight />}
      </span>
    </button>

    {openSections[section] && (
      <ul className=" bg-gray-100/50 border-x text-gray-500 border-gray-200 py-4 px-4 flex flex-col gap-1">
        {vids.map((video) => (
          <li
            key={video.videoId}
            className={`py-1 cursor-pointer flex justify-between items-center ${
              video.videoId === firstVideoId
                ? "font-thin text-md"
                : "opacity-75"
            }`}
            onClick={() => handleVideoClick(video)}
          >
            <span className="flex gap-4 items-center">
              <MonitorPlay size={18} className="font-thin"></MonitorPlay>
              {video.title}
            </span>
            {video.videoId === firstVideoId && (
              <span className="px-1 text-sm font-thin underline text-secondaryBlue">
                Podgląd
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
))}


      {selectedVideo && (
        <div className="my-6 w-full max-w-[1100px]">
          <h3 className="text-xl font-semibold mb-2">
            Podgląd: {selectedVideo.title}
          </h3>
          <div className="aspect-video w-full rounded overflow-hidden shadow">
            <HlsPlayer src={selectedVideo.directUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
