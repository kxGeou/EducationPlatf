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
import '../components/Interactive/Interactive.css'
import Footer from "../components/Footer";
import StripeHero from "../components/StripeHero";
function App() {
  return (
    <main className="flex flex-col items-center justify-center relative">
      
      <div className="flex flex-col items-center justify-start w-full max-w-[1100px] min-h-screen ">
      <div className="gradient-background gradient-hero absolute top-0 left-0 w-full h-[10%] lg:h-[17%] md:h-[15%]"></div>
      <Header></Header>
      <Hero></Hero>
      <p className="flex gap-2 items-center w-full px-6 mt-14 mb-5 opacity-50 lg:hidden">
        <BookMarked size={18}></BookMarked>Dostępne kursy
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
       <Footer></Footer>
       
      </div>
      </div>


    </main>
  );
}

export default App;
