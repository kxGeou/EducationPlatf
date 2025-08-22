import { Clock } from "lucide-react";
import { useFlashcardStore } from "../../store/flashCardStore";
import React, { useEffect, useState } from "react";

function CourseInfo({ course, videos }) {
  const maturaDate = new Date("2026-05-05T08:00:00");

  const getTimeRemaining = () => {
    const now = new Date();
    const total = maturaDate - now;

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    return { total, days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  console.log(course)

  return (
    <div className="w-full h-full bg-white dark:bg-DarkblackBorder rounded-xl px-8 py-5 flex flex-col gap-8 justify-between shadow-lg transition-all min-h-[400px]">
      <div>

      <h3 className="text-2xl font-bold text-blackText mb-4 dark:text-white">
        Informacje o kursie
      </h3>

      <div className="flex flex-col md:flex-row gap-8">
        <img src={course.image_url} alt={course.title} className="rounded-[12px]" loading="lazy"/>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Tytuł kursu
          </span>
          <span className="text-xl font-semibold">{course.title}</span>
        </div>
        <div className="flex flex-col sm:col-span-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Opis kursu
          </span>
          <span className="text-lg max-w-[500px] leading-[25px]">{course.description}</span>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 grid-rows-3 gap-4 md:grid-rows-1  md:h-30 mt-4">
          <div className="flex flex-col px-2 gap-1 py-2 items-center border border-gray-100 justify-center dark:border-DarkblackText shadow-md rounded-[12px]">
            <p className="opacity-75">Liczba lekcji</p>
            <span className="font-semibold text-2xl">5</span>
          </div>
          <div className="flex flex-col px-2 gap-1 py-2 items-center border border-gray-100 justify-center dark:border-DarkblackText shadow-md rounded-[12px]">
            <p className="opacity-75">Liczba działów</p>
            <span className="font-semibold text-2xl">20</span>
          </div>
          <div className="flex flex-col px-2 gap-1 py-2 items-center border border-gray-100 justify-center dark:border-DarkblackText shadow-md rounded-[12px]">
            <p className="opacity-75">Czas kursu</p>
            <span className="font-semibold text-2xl">40h</span>
          </div>
        </div>
        </div>
      </div>
      </div>


      <div className="w-full bg-gradient-to-r from-secondaryBlue to-primaryBlue text-white rounded-[12px] p-6 shadow-md text-center">
        <p className="text-lg  tracking-wide font-semibold mb-2 flex flex-col items-center gap-3">
          <Clock></Clock>
          Czas do matury
        </p>
        <p className="text-2xl md:text-5xl font-bold">
          {String(timeLeft.days).padStart(2, "0")}d :{" "}
          {String(timeLeft.hours).padStart(2, "0")}h :{" "}
          {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
          {String(timeLeft.seconds).padStart(2, "0")}s
        </p>
      </div> 
    </div>
  );
}

export default CourseInfo;
