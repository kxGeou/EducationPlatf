import React from 'react'
import RedHeader from '../homepage/RedHeader';
import HeroBlog from './HeroBlog';
import CourseListHero from '../homepage/CourseListHero';
import Footer from '../homepage/Footer';
import BlogList from './BlogList';
import AboutBlogs from './AboutBlogs';
import ImageSection from './ImageSection';


function BlogMainPage() {
  return (
    <div className='flex flex-col items-center min-h-screen bg-gradient-to-br to-35% from-secondaryGreen to-white'>
      <RedHeader />
      
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