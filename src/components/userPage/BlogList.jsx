import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, SidebarClose } from "lucide-react";
import { motion } from "framer-motion";

const BlogList = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { direct: "/firstBlog", title: "Jak radzić sobie ze stresem" },
    { direct: "/secondBlog", title: "Zarządzanie emocjami w pracy" },
    { direct: "/thirdBlog", title: "Techniki relaksacyjne na co dzień" },
  ];

  return (
    <motion.nav
      animate={{ width: isOpen ? 300 : 70 }} 
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="min-h-[90vh] bg-white dark:bg-DarkblackBorder dark:text-white shadow-lg rounded-2xl px-3 py-6 sticky top-6 border border-gray-100 dark:border-gray-700 flex flex-col"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${!isOpen && "flex-col "}  justify-between w-full mb-5`}
      >
        <span className="flex items-center gap-2 text-primaryBlue dark:text-primaryGreen text-lg pl-2 font-semibold">
          {isOpen && "Materiały pomocnicze"}
        </span>

          <SidebarClose className="text-primaryBlue dark:text-white" size={20} />
      </button>

      <ul className="flex flex-col gap-2">
        {navItems.map((item, index) => (
          <motion.li
            key={index}
            whileHover={{ x: 6 }}
            whileTap={{ scale: 0.97 }}
          >
            <button
              onClick={() => navigate(item.direct)}
              className="w-full text-left px-3 py-3 text-sm rounded-xl flex items-center gap-2 bg-gray-50 dark:bg-blackText hover:bg-primaryBlue hover:text-white transition-all overflow-hidden"
            >
              <ChevronRight size={18} />
              {isOpen && <span className="truncate">{item.title}</span>}
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
};

export default BlogList;
