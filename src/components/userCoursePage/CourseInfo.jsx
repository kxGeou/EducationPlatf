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

  return (
    <div className="w-full h-full bg-white dark:bg-DarkblackBorder rounded-xl p-8 flex flex-col gap-8 shadow-lg transition-all min-h-[400px]">
      <h3 className="text-3xl font-bold text-blackText dark:text-white">
        Informacje o kursie
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-blackText dark:text-white">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Tytuł kursu
          </span>
          <span className="text-lg font-semibold">{course.title}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Liczba lekcji
          </span>
          <span className="text-lg font-semibold">{videos.length}</span>
        </div>

        <div className="flex flex-col sm:col-span-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Opis kursu
          </span>
          <span className="text-lg max-w-[500px] ">{course.description}</span>
        </div>
      </div>

      <div className="w-full bg-gradient-to-r from-secondaryBlue to-secondaryGreen text-white rounded-[12px] p-6 shadow-md text-center">
        <p className="text-lg uppercase tracking-wide font-semibold mb-2">
          Czas do matury
        </p>
        <p className="text-xl sm:text-4xl font-extrabold">
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
