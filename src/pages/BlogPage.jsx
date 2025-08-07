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
        <p className="flex gap-2 items-center w-full px-6 mt-20 mb-6 text-gray-400 dark:text-white/60">
          <BookMarked
            size={18}
            className="text-gray-400  dark:text-white/60"
          ></BookMarked>
          Sprawdź nasze kursy
        </p>
        <CourseListHero></CourseListHero>
        <AboutPost
          first_image={post.first_image}
          first_header={post.first_header}
          first_description={post.first_description}
          second_image={post.second_image}
          second_header={post.second_header}
          second_description={post.second_description}
        ></AboutPost>
        <TextSection third_header={post.third_header} third_description={post.third_description}></TextSection>

        <div className="w-full flex items-center justify-center px-4">
          <ImageSectionPost></ImageSectionPost>
        </div>

        <div className="flex w-full max-w-[1100px]">
          <Footer padding={"px-6"}></Footer>
        </div>
      </div>
    </div>
  );
}
