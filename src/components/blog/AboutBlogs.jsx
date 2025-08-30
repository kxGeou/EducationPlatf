import { ChevronRight } from "lucide-react";
import SectionHeading from "../typography/SectionHeading";
import React from "react";
import { Link } from "react-router-dom";

function AboutBlogs({ section, posts }) {
  return (
    <div
      id={section.replace(/\s+/g, '')}
      className="px-6 flex flex-col mb-[12rem]"
    >
      <SectionHeading textColor={"mb-6 opacity-75 dark:text-white"}>
        {section}
      </SectionHeading>

      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`flex flex-col lg:gap-16 gap-8 mb-16 ${
            index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
          } justify-between`}
        >
          <div className="bg-secondaryBlue/25 dark:text-white w-full lg:w-1/2 rounded-[12px] flex items-center justify-center min-h-[300px]">
        
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            <h2 className="font-bold text-3xl md:text-5xl text-blackText dark:text-white">
              {post.hero_title}
            </h2>
            <p className="text-blackText/75 dark:text-white/75 leading-7 text-base md:text-lg mt-4 md:mt-6">
              {post.first_header}
            </p>
            <Link
              to={`/blog/${post.id}`}
              className="mt-4 text-primaryBlue font-semibold flex items-center gap-1 hover:translate-x-1 transition-all duration-300 hover:underline dark:text-primaryGreen"
            >
              Zobacz bloga <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AboutBlogs;
