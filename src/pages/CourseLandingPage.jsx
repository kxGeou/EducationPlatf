import toast from "react-hot-toast";
import LandingHeader from "../components/coursePage/LandingHeader";
import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";
import Error from "../components/systemLayouts/Error";
import Loading from "../components/systemLayouts/Loading";
import supabase from "../util/supabaseClient";
import Hls from "hls.js";
import {
  ArrowDown01Icon,
  Check,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  MonitorPlay,
  ScreenShareIcon,
  ShoppingBasket,
  TrophyIcon,
  Video,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function CourseLandingPage({ isDark, setIsDark }) {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [firstVideo, setFirstVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyBought, setAlreadyBought] = useState(false);
  const hasFetchedRef = useRef(false);
  const [videos, setVideos] = useState([]);
  const [otherCourses, setOtherCourses] = useState([]);

  useEffect(() => {
    if (hasFetchedRef.current) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, price_cents")
        .eq("id", id)
        .single();

      if (courseError || !courseData) {
        setCourse(null);
        setLoading(false);
        return;
      }

      setCourse(courseData);

      const { data: videosData } = await supabase
        .from("video_base")
        .select("videoId, title, section_title, directUrl")
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
      } else {
        setAlreadyBought(false);
      }

      const { data: otherCoursesData } = await supabase
        .from("courses")
        .select("id, title, description, price_cents")
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
      toast.error("Musisz być zalogowany, żeby kupić kurs.");
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
      toast.error("Błąd przy tworzeniu sesji płatności:", data);
      alert("Coś poszło nie tak. Spróbuj ponownie.");
    }
  };

  if (loading) return <Loading isDark={isDark} />;
  if (!course) return <Error isDark={isDark} />;

  const learn = [
    "Programować w wybranym języku",
    "Pisać zaawansowane skrypty",
    "Doświadczenie do dalszej przygody z programowaniem",
    "Zaznajomienie się z najnowszymi technologiami",
  ];

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="w-full flex flex-col items-center dark:bg-blackText"
    >
      <Header isDark={isDark} setIsDark={setIsDark} />

      <section className="relative bg-gradient-to-br from-darkBlue to-primaryBlue dark:from-blackText dark:to-DarkblackText text-white py-24 w-full">
        <div className="max-w-[1100px] w-full mx-auto px-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          <div className="mt-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-snug mb-4">
              {course.title}
            </h1>
            <p className="text-lg opacity-80 max-w-[600px]">{course.description}</p>
            <div className="mt-8 flex items-center gap-6">
              <p className="text-3xl font-semibold">
                {course.price_cents} zł{" "}
                <span className="ml-2 text-xl opacity-60 line-through">
                  220 zł
                </span>
              </p>
              {!alreadyBought ? (
                <button
                  onClick={handleBuy}
                  className="px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-secondaryBlue to-primaryBlue hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                >
                  <ShoppingBasket size={20} />
                  Kup teraz
                </button>
              ) : (
                <span className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/70 cursor-not-allowed">
                  Posiadasz ten kurs
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 hidden lg:flex justify-center">
            <div className="bg-black/50 w-[22rem] h-[14rem] rounded-2xl flex items-center justify-center shadow-xl">
              Podgląd kursu
            </div>
          </div>
        </div>
      </section>

      <main className="w-full max-w-[1100px] px-4">
        <section className="bg-white dark:bg-DarkblackText p-8 rounded-2xl shadow-md mt-12">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Czego się nauczysz
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learn.map((l, index) => (
              <li
                key={index}
                className="flex gap-3 items-start text-gray-700 dark:text-white/70"
              >
                <Check className="text-primaryGreen" size={20} />
                {l}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Ten kurs obejmuje
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Feature
              icon={<Video size={22} />}
              text="12 godz. treści video"
            />
            <Feature
              icon={<ScreenShareIcon size={22} />}
              text="Dostęp na wszystkich urządzeniach"
            />
            <Feature
              icon={<TrophyIcon size={22} />}
              text="Certyfikat po kursie"
            />
            <Feature
              icon={<ArrowDown01Icon size={22} />}
              text={`${videos.length} filmów video`}
            />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Treść kursu
          </h2>
          <CourseSections videos={videos} firstVideoId={firstVideo?.videoId} />
        </section>

        <section className="mt-16 mb-24">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Inne kursy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherCourses.length === 0 && <p>Brak innych kursów.</p>}
            {otherCourses.map(({ id: cId, title, description }) => (
              <div
                key={cId}
                onClick={() => navigate(`/`)}
                className="rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all bg-white dark:bg-DarkblackText cursor-pointer"
              >
                <img
                  src="../react2.png"
                  alt="mockup image"
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white/60 mt-1">
                    {description}
                  </p>
                  <p className="mt-3 text-primaryBlue dark:text-primaryGreen font-bold">
                    {(course.price_cents ? course.price_cents : course.price) +
                      " zł"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer padding="px-4"/>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-DarkblackBorder rounded-xl shadow-sm">
      <span className="text-secondaryBlue dark:text-primaryGreen">{icon}</span>
      <span className="text-gray-800 dark:text-white/70">{text}</span>
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
    <video
      ref={videoRef}
      controls
      className="w-full h-full bg-black rounded-xl shadow-lg"
    />
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
    <div className="rounded-xl">
      {Object.entries(groupedVideos).map(([section, vids]) => (
        <div
          key={section}
          className="rounded-xl overflow-hidden border border-gray-200 dark:border-DarkblackBorder mb-3"
        >
          <button
            onClick={() => toggleSection(section)}
            className="w-full text-left font-semibold text-lg flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-DarkblackBorder dark:text-white"
          >
            {section}
            <span>{openSections[section] ? <ChevronDown /> : <ChevronRight />}</span>
          </button>

          {openSections[section] && (
            <ul className="bg-gray-50 dark:bg-DarkblackText py-3 px-4 flex flex-col gap-2">
              {vids.map((video) => (
                <li
                  key={video.videoId}
                  className="py-2 cursor-pointer flex justify-between items-center hover:bg-gray-100 dark:hover:bg-DarkblackBorder px-2 rounded-md transition-all"
                  onClick={() => handleVideoClick(video)}
                >
                  <span className="flex gap-3 items-center dark:text-white/80">
                    <MonitorPlay size={18} />
                    {video.title}
                  </span>
                  {video.videoId === firstVideoId && (
                    <span className="px-2 text-xs font-medium underline text-primaryBlue dark:text-primaryGreen">
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
        <div className="my-8">
          <h3 className="text-lg font-semibold mb-3 dark:text-white">
            Podgląd:{" "}
            <span className="font-normal text-gray-600 dark:text-white/60">
              {selectedVideo.title}
            </span>
          </h3>
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
            <HlsPlayer src={selectedVideo.directUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
