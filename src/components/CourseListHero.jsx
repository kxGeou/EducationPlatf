import Access from "/access.svg";
import Excel from "/excel.svg";
import Forms from "/forms.svg";
import Python from "/python.svg";
import React from "react";

function CourseListHero() {
  const courses = [
    {
      label: "Excel",
      icon: Excel,
    },
    {
      label: "Teoria",
      icon: Forms,
    },
    {
      label: "Access",
      icon: Access,
    },
    {
      label: "Python",
      icon: Python,
    },
  ];

  return (
    <section className="grid grid-cols-2 grid-rows-2 w-full gap-4  px-6">
        {courses.map((courses, index) => (
            <div key={index} className="bg-gray-100/50 border border-gray-200 rounded-lg flex justify-center items-center py-2 gap-2 flex-col transition-all hover:bg-gray-300/30 cursor-pointer">
                <img src={courses.icon} alt="#" className="w-10"/>
                <p>{courses.label}</p>
            </div>
        ))}
    </section>
  );
}

export default CourseListHero;
