import React from 'react';
import { useNavigate } from 'react-router-dom';
import useWindowWidth from '../../hooks/useWindowWidth';
import { ChevronRight, FileQuestion } from 'lucide-react';

const BlogNav = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();

  const navItems = [
    {
      direct: "/firstBlog",
      title: "Jak radzić sobie ze stresem"
    },
    {
      direct: "/secondBlog",
      title: "Zarządzanie emocjami w pracy"
    },
    {
      direct: "/thirdBlog",
      title: "Techniki relaksacyjne na co dzień"
    },
  ];

  if (width <= 1200) return null;

  return (
    <nav className="absolute top-18 my-4 left-0 bg-white shadow-lg rounded-2xl max-h-screen w-80 px-6 py-5 ">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-primaryBlue mb-4">
        Materiały pomocnicze <FileQuestion size={20} />
      </h2>
      <ul className="flex flex-col gap-1">
        {navItems.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => navigate(item.direct)}
              className="w-full cursor-pointer text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between hover:bg-slate-100 transition-all hover:text-primaryBlue"
            >
              {item.title}
              <ChevronRight size={18} />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BlogNav;
