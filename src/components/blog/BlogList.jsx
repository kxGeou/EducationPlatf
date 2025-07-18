import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from '../typography/SectionHeading';
import BlogCard from './BlogCard';

const talks = [
  {
    image: '../react2.png',
    title: 'Opening keynote: The future of commerce',
    description: 'The future of commerce is being written by businesses growing 7x faster than S&P 500 companies...',
  },
  {
    image: '../react2.png',
    title: 'A conversation with Mark Zuckerberg',
    description: 'Meta CEO Mark Zuckerberg joins John Collison to talk about how advanced technologies are reshaping...',
  },
  {
    image: '../react2.png',
    title: 'A conversation with Sir Jony Ive KBE',
    description: 'Jony Ive — Steve Jobs’s “spiritual partner” — joins Patrick Collison on stage for a conversation about design...',
  },
  {
    image: '../react2.png',
    title: 'A conversation with Sir Jony Ive KBE',
    description: 'Jony Ive — Steve Jobs’s “spiritual partner” — joins Patrick Collison on stage for a conversation about design...',
  },
];

function BlogList() {
  const scrollRef = useRef(null);

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className='px-6 mt-36 w-full'>
      <div className='flex items-center justify-between mb-4'>
        <SectionHeading>Lista blogów</SectionHeading>
        <div className='flex gap-2'>
          <button
            onClick={() => scroll(-320)}
            className='bg-secondaryBlue/25 text-secondaryBlue border border-secondaryBlue/10 hover:bg-secondaryBlue/35 transition-all duration-200 shadow p-2 cursor-pointer rounded-full'
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll(320)}
            className='bg-secondaryBlue/25 text-secondaryBlue border border-secondaryBlue/10 hover:bg-secondaryBlue/35 transition-all duration-200 shadow p-2 cursor-pointer rounded-full'
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className='flex gap-7 overflow-x-scroll py-4 scrollbar-hide scroll-smooth'
      >
        {talks.map((talk, idx) => (
          <BlogCard key={idx} {...talk} />
        ))}
      </div>
    </section>
  );
}

export default BlogList;
