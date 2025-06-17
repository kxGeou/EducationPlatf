import Header from "../components/Header";
import { useState } from "react";
import "./AuthPage.css";
import CourseListHero from "../components/CourseListHero";
import Hero from "../components/Hero";
import About from "../components/About";
import Interactive from '../components/Interactive/Interactive'
import { BookMarked } from "lucide-react";
import Courses from "../components/Courses";
import AboutPlatform from "../components/AboutPlatform";
import Reviews from "../components/Reviews";

function App() {
  return (
    <main className="relative flex flex-col items-center justify-start min-h-screen bg-white">
      <div className="gradient-background gradient-hero absolute top-0 left-0 w-full h-[22rem]"></div>
      <Header></Header>
      <Hero></Hero>
      <p className="flex gap-2 items-center w-full px-6 mt-14 mb-5 opacity-50">
        <BookMarked size={18}></BookMarked>Dostępne kursy
      </p>
      <CourseListHero></CourseListHero>
      <About></About>
      <Interactive></Interactive>
      <Courses></Courses>
      <AboutPlatform></AboutPlatform>
      <Reviews></Reviews>
    </main>
  );
}

export default App;
