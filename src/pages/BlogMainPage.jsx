import React, { useEffect } from 'react';
import Header from '../components/homepage/Header';
import HeroBlog from '../components/blog/HeroBlog';
import CourseListHero from '../components/homepage/CourseListHero';
import Footer from '../components/homepage/Footer';
import AboutBlogs from '../components/blog/AboutBlogs';
import BlogList from '../components/blog/BlogList';
import { useBlogStore } from '../store/blogStore';

function BlogMainPage({ isDark, setIsDark }) {
  const { fetchBlogs, blogs } = useBlogStore();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const categories = [
    "Po egzaminie",
    "Informatyka w praktyce",
    "Psychika i motywacja",
    "Egzamin i nauka",
    "Inne",
  ];

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className='flex flex-col items-center min-h-screen bg-gradient-to-br to-18% from-secondaryGreen to-white dark:from-primaryBlue dark:to-23% dark:to-blackText'
    >
      <Header isDark={isDark} setIsDark={setIsDark} />

      <div className='w-full max-w-[1100px] mt-26 lg:mt-38 mb-42'>
        <HeroBlog />
        <CourseListHero />
      </div>

      <div className="flex flex-col w-full max-w-[1100px] gap-20">
        {categories.map(category => {
          const categoryBlogs = blogs.filter(blog => blog.category === category);

          if (category === "Inne") {
            return <BlogList key={category} posts={categoryBlogs} />;
          }

          if (categoryBlogs.length > 0) {
            return (
              <AboutBlogs
                key={category}
                posts={categoryBlogs.slice(0, 2)}
                section={category}
              />
            );
          }

          return null;
        })}
      </div>

      <div className="flex w-full max-w-[1100px] mt-20">
        <Footer />
      </div>
    </div>
  );
}

export default BlogMainPage;
