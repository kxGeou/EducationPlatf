import React from 'react'
import Header from '../components/homepage/Header';
import HeroBlog from '../components/blog/HeroBlog';
import CourseListHero from '../components/homepage/CourseListHero';
import Footer from '../components/homepage/Footer';
import BlogList from '../components/blog/BlogList';
import AboutBlogs from '../components/blog/AboutBlogs';
import ImageSection from '../components/blog/ImageSection';


function BlogMainPage() {
  return (
    <div className='flex flex-col items-center min-h-screen bg-gradient-to-br to-35% from-secondaryGreen to-white'>
      <Header />
      
      <div className='w-full max-w-[1100px] mt-26 lg:mt-38'>
        <HeroBlog />
        <CourseListHero />
        <BlogList />
        <AboutBlogs />
      </div>

      <div className='w-full flex items-center justify-center'>
        <ImageSection />
      </div>

      <div className='w-full max-w-[1100px]'>
        <Footer />
      </div>
    </div>
  )
}


export default BlogMainPage