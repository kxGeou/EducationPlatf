import React from 'react';
import { ChevronRight } from 'lucide-react';

function BlogCard({ image, title, description }) {
  return (
    <div className='min-w-[300px] max-w-[320px] rounded-xl shadow-lg bg-white dark:bg-DarkblackBorder overflow-hidden flex flex-col'>
      <img src={image} alt={title} className='w-full h-48 object-cover' />
      <div className='p-4 flex flex-col justify-between flex-grow'>
        <h3 className='text-xl font-bold text-black dark:text-white'>{title}</h3>
        <p className='text-sm text-gray-600 mt-2 dark:text-white/75 line-clamp-3'>{description}</p>
        <button className='flex items-center text-secondaryBlue dark:text-primaryGreen cursor-pointer font-semibold mt-4 text-sm hover:underline'>
          Zobacz blog <ChevronRight size={16} className='ml-1' />
        </button>
      </div>
    </div>
  );
}

export default BlogCard;
