import { useState } from "react";
import "../styles/AuthPage.css";
import CourseListHero from "../components/homepage/CourseListHero";
import Hero from "../components//homepage/Hero";
import About from "../components/homepage/About";
import Interactive from '../components/homepage/Interactive'
import { BookMarked } from "lucide-react";
import Courses from "../components/homepage/Courses";
import AboutPlatform from "../components/homepage/AboutPlatform";
import Reviews from "../components/homepage/Reviews";
import '../styles/Interactive.css'
import Footer from "../components/homepage/Footer";
import StripeHero from "../components/homepage/StripeHero";
import Header from "../components/homepage/Header";

function App() {

 
  
  return (
    <main className="flex flex-col items-center justify-center relative">
      
      <div  className="flex flex-col items-center justify-start w-full max-w-[1100px] min-h-screen ">

     <div className="corner-gradient" />


      <div className="relative flex items-center justify-center z-10 w-full max-w-[1100px] px-6">
       <Header></Header>
      </div>
      <Hero></Hero>
      <p className="flex gap-2 items-center w-full px-6 mt-20 mb-6 text-gray-400">
        <BookMarked size={18} className="text-gray-400"></BookMarked>Dostępne kursy
      </p>
      <CourseListHero></CourseListHero>
      
      <About></About>
      </div>
      <div className="flex flex-col items-center justify-start w-full bg-darkBlue banner mt-26">
      <div className="flex w-full max-w-[1100px]">
        <Interactive></Interactive>
      </div>
      </div>
      
      
      <div className="flex flex-col items-center justify-start w-full max-w-[1100px]">

      <Courses></Courses>


      
      </div>

      <div className="flex flex-col items-center justify-start w-full bg-blue-100/50 mt-26">
      <div className="flex w-full max-w-[1100px]">
       <AboutPlatform></AboutPlatform>
       
      </div>
      </div>


      <Reviews></Reviews>
      <StripeHero></StripeHero>
      <div className="flex flex-col items-center justify-start w-full bg-white border-t border-gray-300 mt-26">
      <div className="flex w-full max-w-[1100px]">
       <Footer padding={"px-6"}></Footer>
       
      </div>
      </div>


    </main>
  );
}

export default App;
