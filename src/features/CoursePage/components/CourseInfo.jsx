import { Clock } from "lucide-react";
import { useFlashcardStore } from '../../../store/flashCardStore';
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
    <div className="w-full h-full p-3 rounded-2xl flex flex-col gap-8 justify-between transition-all">
      <div>

        <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
        Informacje o kursie
      </span>

      <div className="flex flex-col md:flex-row gap-8">
        <img src={course.image_url} alt={course.title} className="rounded-xl" loading="lazy"/>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
          <span className="text-sm font-medium dark:text-white/50 text-blackText/75">
            Tytuł kursu
          </span>
          <span className="text-xl font-semibold text-blackText dark:text-white">{course.title}</span>
        </div>
        <div className="flex flex-col sm:col-span-2">
          <span className="text-sm font-medium dark:text-white/50 text-blackText/75">
            Opis kursu
          </span>
          <span className="text-lg max-w-[500px] leading-[25px] text-blackText dark:text-white">{course.description}</span>
        </div>

        {/* DEV: Statystyki kursu (Liczba lekcji, Liczba działów, Czas kursu) - odkomentuj na development, zakomentuj na main */}
        {/* <div className="grid md:grid-cols-3 grid-cols-1 grid-rows-3 gap-4 md:grid-rows-1  md:h-30 mt-4">
          <div className="flex flex-col px-2 gap-1 py-2 items-center border bg-white border-gray-100 justify-center dark:border-0 dark:bg-DarkblackText shadow-md rounded-[12px]">
            <p className="opacity-75">Liczba lekcji</p>
            <span className="font-semibold text-2xl">5</span>
          </div>
          <div className="flex flex-col px-2 gap-1 py-2 items-center border bg-white border-gray-100 justify-center dark:border-0 dark:bg-DarkblackText shadow-md rounded-[12px]">
            <p className="opacity-75">Liczba działów</p>
            <span className="font-semibold text-2xl">20</span>
          </div>
          <div className="flex flex-col px-2 gap-1 py-2 items-center border bg-white border-gray-100 justify-center dark:border-0 dark:bg-DarkblackText shadow-md rounded-[12px]">
            <p className="opacity-75">Czas kursu</p>
            <span className="font-semibold text-2xl">40h</span>
          </div>
        </div> */}
        {/* DEV: END Statystyki kursu */}
        </div>
      </div>
      </div>


      <div className="w-full bg-gradient-to-r from-secondaryBlue to-primaryBlue dark:from-secondaryBlue dark:to-primaryGreen text-white rounded-xl p-6 shadow-md text-center">
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
