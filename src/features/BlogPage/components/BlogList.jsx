import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from '../../../components/typography/SectionHeading';
import BlogCard from './BlogCard';

function BlogList({ posts }) {
  const scrollRef = useRef(null);

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="Inne" className='px-6 mt-36 w-full'>
      <div className='flex items-center justify-between mb-4'>
        <SectionHeading textColor={"dark:text-secondaryGreen"}>
          Inne blogi które mogą cię zainteresować
        </SectionHeading>
        <div className='flex gap-2'>
          <button
            onClick={() => scroll(-320)}
            className='bg-secondaryBlue/25 text-secondaryBlue dark:bg-secondaryBlue/50 dark:text-blackText border border-secondaryBlue/10 hover:bg-secondaryBlue/35 transition-all duration-200 shadow p-2 cursor-pointer rounded-full'
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll(320)}
            className='bg-secondaryBlue/25 text-secondaryBlue dark:bg-secondaryBlue/50 dark:text-blackText border border-secondaryBlue/10 hover:bg-secondaryBlue/35 transition-all duration-200 shadow p-2 cursor-pointer rounded-full'
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className='flex gap-7 overflow-x-scroll py-4 scrollbar-hide scroll-smooth'
      >
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            image={post.cover_image}
            title={post.hero_title}
            description={post.first_header.slice(0, 120) + '...'}
          />
        ))}
      </div>
    </section>
  );
}

export default BlogList;
