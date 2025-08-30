import AboutPost from "../components/blog/blogPage/AboutPost";
import ImageSectionPost from "../components/blog/blogPage/ImageSectionPost";
import PostHeader from "../components/blog/blogPage/PostHeader";
import TextSection from "../components/blog/blogPage/TextSection";
import CourseListHero from "../components/homepage/CourseListHero";
import Footer from "../components/homepage/Footer";
import RedHeader from "../components/homepage/Header";
import Error from "../components/systemLayouts/Error";
import Loading from "../components/systemLayouts/Loading";
import supabase from "../util/supabaseClient";
import { BookMarked } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function BlogPage({ isDark, setIsDark }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Błąd pobierania wpisu:", error);
        setErrorState(true);
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) return <Loading isDark={isDark} />;
  if (errorState || !post) return <Error isDark={isDark} />;

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="flex flex-col w-full  items-center min-h-screen bg-gradient-to-br to-35% from-secondaryGreen to-white dark:from-primaryBlue dark:to-23% dark:to-blackText "
    >
      <RedHeader isDark={isDark} setIsDark={setIsDark}></RedHeader>
      <div className="w-full max-w-[1100px]">
        <PostHeader
          hero_title={post.hero_title}
          hero_description={post.hero_description}
          hero_image={post.cover_image}
        ></PostHeader>
       
        <CourseListHero></CourseListHero>
      
        <div className="flex w-full max-w-[1100px]">
          <Footer padding={"px-4"}></Footer>
        </div>
      </div>
    </div>
  );
}
