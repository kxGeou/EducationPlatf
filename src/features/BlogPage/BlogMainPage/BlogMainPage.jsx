import React, { useEffect } from 'react';
import PageLayout from '../../../components/systemLayouts/PageLayout';
import HeroBlog from '../components/HeroBlog';
import CourseListHero from '../../HomePage/components/CourseListHero';
import AboutBlogs from '../components/AboutBlogs';
import BlogList from '../components/BlogList';
import { useBlogStore } from '../../../store/blogStore';
import '../../../styles/AuthPage.css';
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
      from="#8c5cfa"
  fromDark="#4a15c2" stopAt="8%"
    >
      <div className='mt-28 mb-16 z-10 relative'>
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
