import React from 'react'
import RedHeader from '../homepage/RedHeader';
import HeroBlog from './HeroBlog';
function BlogMainPage() {
  return (
    <div className='flex justify-center min-h-screen'>
        <RedHeader></RedHeader>
        <div className='w-full max-w-[1100px] px-6 mt-30 lg:mt-48'>
            <HeroBlog></HeroBlog>
        </div>
    </div>
  )
}

export default BlogMainPage