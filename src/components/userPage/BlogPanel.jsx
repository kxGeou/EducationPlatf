import React, { useEffect, useState, useMemo } from "react";
import { useBlogStore } from "../../store/blogStore";

function BlogPanel() {
  const { blogs, fetchBlogs } = useBlogStore();

  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const categories = [
    "Wszystkie",
    "Inne",
    "Po egzaminie",
    "Informatyka w praktyce",
    "Psychika i motywacja",
    "Egzamin i nauka",
  ];

  const filteredBlogs = useMemo(() => {
    if (selectedCategory === "Wszystkie") return blogs;
    return blogs.filter((b) => b.category === selectedCategory);
  }, [blogs, selectedCategory]);

  return (
    <div className="w-full mt-2">
      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mt-18 mb-12 md:mt-0">
        Blogi
      </span>

      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-[8px] text-sm font-semibold transition cursor-pointer
              ${
                selectedCategory === cat
                  ? "bg-primaryBlue text-white dark:bg-primaryGreen"
                  : "bg-gray-200 dark:bg-DarkblackText text-blackText dark:text-white"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {filteredBlogs.map((b, index) => (
          <div
            key={index}
            className="text-blackText dark:text-white p-4 border border-gray-200 shadow-md dark:border-0 bg-white dark:bg-DarkblackText rounded-[12px] flex flex-col justify-between items-start"
          >
            <span>
              <span className="text-primaryBlue dark:text-primaryGreen font-semibold">
                {b.category}
              </span>

              <p className="font-bold mt-2 text-lg mb-1">{b.hero_title}</p>
              <p className="line-clamp-2 opacity-75">{b.first_header}</p>
            </span>

            <button className="bg-primaryBlue dark:bg-primaryGreen py-3 text-center transition hover:-translate-y-1 duration-300 cursor-pointer mt-4 w-full rounded-[10px] font-semibold text-white shadow-lg">
              Zobacz bloga
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogPanel;
