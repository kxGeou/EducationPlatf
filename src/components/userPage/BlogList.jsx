
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, FileQuestion } from "lucide-react";
import { motion } from "framer-motion";
const BlogList = () => {
  const navigate = useNavigate();

  const navItems = [
    { direct: "/firstBlog", title: "Jak radzić sobie ze stresem" },
    { direct: "/secondBlog", title: "Zarządzanie emocjami w pracy" },
    { direct: "/thirdBlog", title: "Techniki relaksacyjne na co dzień" },
  ];

  return (
    <nav className="w-full max-w-[300px] min-h-[90vh] bg-white dark:bg-DarkblackBorder dark:text-white shadow-lg rounded-2xl px-6 py-6 sticky top-6 border border-gray-100 dark:border-gray-700">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-primaryBlue dark:text-primaryGreen mb-5">
        Materiały pomocnicze <FileQuestion size={20} />
      </h2>
      <ul className="flex flex-col gap-2">
        {navItems.map((item, index) => (
          <motion.li key={index} whileHover={{ x: 6 }} whileTap={{ scale: 0.97 }}>
            <button
              onClick={() => navigate(item.direct)}
              className="w-full text-left px-4 py-3 text-sm rounded-xl flex items-center justify-between bg-gray-50 dark:bg-blackText hover:bg-primaryBlue hover:text-white transition-all overflow-hidden"
            >
              <span className="truncate">{item.title}</span>
              <ChevronRight size={18} />
            </button>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
};

export default BlogList;
