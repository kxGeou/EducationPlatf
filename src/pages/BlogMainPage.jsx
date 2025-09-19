import React, { useEffect } from 'react';
import PageLayout from '../components/systemLayouts/PageLayout';
import HeroBlog from '../components/blog/HeroBlog';
import CourseListHero from '../components/homepage/CourseListHero';
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
    <PageLayout 
      isDark={isDark} 
      setIsDark={setIsDark}
      className="bg-gradient-to-br to-18% from-secondaryGreen to-gray-100 dark:from-primaryBlue dark:to-23% dark:to-blackText"
    >
      <div className='mt-8 mb-16'>
        <HeroBlog />
        <CourseListHero />
      </div>

      <div className="space-y-16">
        {categories.map(category => {
          const categoryBlogs = blogs.filter(blog => blog.category === category);

          if(category == "Inne") {
            return
          }
          
          if (categoryBlogs.length > 0) {
            return (
              <div key={category} >
                <AboutBlogs
                  posts={categoryBlogs.slice(0, 2)}
                  section={category}
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      <div className='mt-16'>
        {categories.map(category => {
          const categoryBlog = blogs.filter(blog => blog.category === category);

          if(category === "Inne") {
            return (
              <div key={category} >
                <BlogList posts={categoryBlog} />
              </div>
            );
          }
        })}
      </div>
    </PageLayout>
  );
}

export default BlogMainPage;
