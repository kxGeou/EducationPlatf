import React from 'react'
import { useNavigate } from 'react-router-dom'
import useWindowWidth from '../../hooks/useWindowWidth';
import { ChevronRight, FileQuestion } from 'lucide-react';
function BlogList() {
    const navigate = useNavigate();
    const width = useWindowWidth();
    const nav = [
        {
            direct: "/firstBlog",
            title: "Jak radzić sobie ze stresem"
        },
        {
            direct: "/firstBlog",
            title: "Jak radzić sobie ze stresem"
        },
        {
            direct: "/firstBlog",
            title: "Jak radzić sobie ze stresem"
        },
    ]
  return (
    <div className={`w-[20%] flex flex-col items-center ${width > 1100 ? "flex items-center gap-2" : "hidden"}`}>
        <h2 className='flex gap-2 items-center text-lg mb-4 text-primaryBlue'>Materiały pomocnicze <FileQuestion size={20}></FileQuestion></h2>
        <ul className='flex flex-col gap-3'>
            {nav.map((n, index) => (
                <li onClick={() => navigate(n.direct)} className={`text-md  transition-all hover:text-primaryBlue cursor-pointer hover:translate-x-1`} key={index}><ChevronRight size={17}></ChevronRight>{n.title}</li>
            ))}
        </ul>
    </div>
  )
}

export default BlogList