  import { useParams, useNavigate } from "react-router-dom";
  import { useEffect, useState, useRef } from "react";
  import supabase from "../util/supabaseClient";
  import { useAuth } from "../context/AuthContext";
  import Hls from "hls.js";
import Header from "../components/homepage/Header";
import LandingHeader from "../components/coursePage/LandingHeader";

  export default function CourseLandingPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [firstVideo, setFirstVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alreadyBought, setAlreadyBought] = useState(false);

   const hasFetchedRef = useRef(false);

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
      .select("title, directUrl")
      .eq("course_id", id)
      .order("order", { ascending: true })
      .limit(1);

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

    return (
      <div className="w-full flex flex-col items-center">
        <LandingHeader></LandingHeader>
      <main className="w-full max-w-[1100px]">
        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-700 mb-6">{course.description}</p>

        {!alreadyBought && (
          <button
            onClick={handleBuy}
            className="mb-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Kup kurs za {course.price_cents} zł
          </button>
        )}

        {alreadyBought && (
          <p className="mb-6 text-green-600 font-semibold">✅ Posiadasz ten kurs</p>
        )}

        {firstVideo ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">{firstVideo.title}</h2>
            <div className="aspect-video w-full rounded overflow-hidden shadow">
              <HlsPlayer src={firstVideo.directUrl} />
            </div>
          </div>
        ) : (
          <p>Brak wideo w tym kursie.</p>
        )}
      </main>
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
        className="w-full h-full bg-black rounded"
      />
    );
  }
