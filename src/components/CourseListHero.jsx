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
    <section className="w-full lg:mt-16">
      <ul className="grid grid-cols-2 grid-rows-2 lg:grid-cols-4 lg:grid-rows-1 w-full gap-4  px-6">
        {courses.map((courses, index) => (
            <li key={index} className="bg-gray-100/50 border border-gray-200 rounded-lg flex justify-center items-center py-2 gap-2 flex-col transition-all hover:bg-gray-300/30 cursor-pointer lg:bg-white lg:border-0">
                <img src={courses.icon} alt="#" className="w-10 lg:w-13"/>
                <p className="text-blackText">{courses.label}</p>
            </li>
        ))}
      </ul>
    </section>
  );
}

export default CourseListHero;
