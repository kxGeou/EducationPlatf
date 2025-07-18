import React from 'react'
import RedHeader from '../homepage/RedHeader';
import HeroBlog from './HeroBlog';
import CourseListHero from '../homepage/CourseListHero';
function BlogMainPage() {
  return (
    <div className='flex justify-center min-h-screen bg-gradient-to-br to-35% from-secondaryGreen to-white'>
        <RedHeader></RedHeader>
        <div className='w-full max-w-[1100px] mt-26 lg:mt-38'>
            <HeroBlog></HeroBlog>
            <CourseListHero></CourseListHero>
        </div>
    </div>
  )
}

export default BlogMainPage