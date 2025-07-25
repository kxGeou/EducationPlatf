import toast from "react-hot-toast";
import LandingHeader from "../components/coursePage/LandingHeader";
import Footer from "../components/homepage/Footer";
import RedHeader from "../components/homepage/RedHeader";
import Error from "../components/systemLayouts/Error";
import Loading from "../components/systemLayouts/Loading";
import { useAuth } from "../context/AuthContext";
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

  if (loading) return <Loading></Loading>;
  if (!course) return <Error></Error>;

  const learn = [
    "Programować w wybranym języku",
    "Pisać się zaawansowane skrypty",
    "Doświadczenie do dalszej przygody z programowaniem",
    "Zaznajomienie się z najnowszymi technologiami",
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* <LandingHeader></LandingHeader> */}
      <RedHeader></RedHeader>
      <section className="bg-darkBlue flex justify-center text-white px-4 py-28 w-full ">
        <div className="max-w-[1100px] w-full min-h-[10rem] flex justify-between items-start relative px-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2 md:text-4xl">
              {course.title}
            </h1>
            <p className="opacity-75 mb-6 md:text-lg">{course.description}</p>

            <p className="text-white font-bold text-2xl mt-8 mb-2 lg:hidden">
              {course.price_cents} zł
            </p>
            {!alreadyBought && (
              <button
                onClick={handleBuy}
                className="px-4 py-3 flex gap-3 items-center lg:hidden justify-center border font-bold border-white w-full text-white cursor-pointer rounded transition-all duration-300 hover:bg-white hover:text-darkBlue"
              >
                <ShoppingBasket size={18}></ShoppingBasket> Kup teraz
              </button>
            )}

            {alreadyBought && (
              <p className="flex lg:hidden cursor-not-allowed items-center justify-center border px-4 py-3 rounded border-white/50 w-full text-white/50 font-semibold">
                Posiadasz ten kurs
              </p>
            )}
          </div>
            <aside className="lg:block hidden bg-white right-6 absolute w-[20rem] shadow-lg rounded-lg p-3">
              <div className="bg-darkBlue flex items-center h-40 w-full justify-center">
                prototyp
              </div>

              <p className="text-black font-bold text-2xl mt-4 mb-2">
                {course.price_cents} zł
              </p>
              {!alreadyBought && (
                <button
                  onClick={handleBuy}
                  className="px-4 py-3 flex gap-3 items-center justify-center border font-bold border-darkBlue w-full text-darkBlue cursor-pointer rounded transition-all duration-300 hover:bg-darkBlue hover:text-white"
                >
                  <ShoppingBasket size={18}></ShoppingBasket> Kup teraz
                </button>
              )}

              {alreadyBought && (
                <p className="flex cursor-not-allowed items-center justify-center border px-4 py-3 rounded border-darkBlue/50 w-full text-darkBlue/50 font-semibold">
                  Posiadasz ten kurs
                </p>
              )}
              <div className="text-gray-600 text-sm mt-6 flex flex-col gap-1 items-start">
                <span>Roczny dostęp do kursu</span>
                <span>Gwarancja profesjonalnej obsługi</span>
              </div>
            </aside>
            
        </div>
      </section>

      <main className="w-full max-w-[1100px] px-6">
        <section className="border-[0.75px] p-4 mt-16 border-gray-400 md:py-6 rounded-xl w-full max-w-[650px]">
          <h2 className="text-xl font-bold md:text-2xl">Czego się nauczysz</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 items-start mt-2 md:mt-4">
            {learn.map((l, index) => (
              <li
                className="flex gap-3 items-start text-gray-700 text-sm"
                key={index}
              >
                <Check size={18} className="text-secondaryGreen"></Check> {l}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col my-16 relative ">
          <h2 className="text-xl font-bold mb-4 md:text-2xl">
            Ten kurs obejmuje:
          </h2>

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
              <ArrowDown01Icon
                size={18}
                className="text-secondaryBlue"
              ></ArrowDown01Icon>
              {videos.length} Filmów Video
            </span>
          </ul>

          <div className="absolute -right-10 -top-30 hidden lg:block">
              <img src="../robocik.svg" className="w-[24rem]"/>
            </div>
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
                className="relative shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex flex-col items-start pb-4 cursor-pointer rounded-[12px] overflow-hidden group"
                onClick={() => navigate(`/`)}
              >
                <img
                  src="../react2.png"
                  alt="mockup image"
                  className="max-h-50 w-full rounded-t-[12px] mb-3"
                />

                <div className="flex items-center justify-center gap-2 absolute top-3 left-4 bg-secondaryGreen/75 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-1 rounded-[8px] opacity-0 -translate-x-10 group-hover:-translate-x-1 group-hover:opacity-100 transition-all duration-300 z-10 shadow-sm">
                  Zobacz szczegóły <Lightbulb size={15} />
                </div>

                <div className="px-4 flex flex-col z-10">
                  <h2 className="text-xl font-semibold text-blackText">
                    {title}
                  </h2>
                  <p className="text-blackText/50 text-sm">{description}</p>
                </div>

                <div className="flex flex-col items-start gap-1 w-full px-4 mt-3 z-10">
                  <span className="flex gap-2 items-center">
                    <p className="text-lg text-blackText">
                      {(course.price_cents
                        ? course.price_cents
                        : course.price) + " zł"}
                    </p>
                    <p className="text-md text-blackText/50 line-through">
                      220 zł
                    </p>
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-0"></div>
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
    <div className="rounded-xl ">
    {Object.entries(groupedVideos).map(([section, vids], idx) => (
          <div
            key={section}
            className="rounded-xl overflow-hidden border border-gray-300 mb-2"
          >
            <button
              onClick={() => toggleSection(section)}
              className="w-full text-left font-semibold text-md flex justify-between items-center px-4 py-4 bg-gray-100/90"
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
            <span className="font-normal text-gray-400">Podgląd:</span>{" "}
            {selectedVideo.title}
          </h3>
          <div className="aspect-video w-full rounded overflow-hidden shadow">
            <HlsPlayer src={selectedVideo.directUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
