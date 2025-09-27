import "../../styles/AuthPage.css";
import CourseListHero from "./components/CourseListHero";
import Hero from "./components/Hero";
import About from "./components/About";
import Interactive from './components/Interactive'
import { BookMarked } from "lucide-react";
import Courses from "./components/Courses";
import AboutPlatform from "./components/AboutPlatform";
import Reviews from "./components/Reviews";
import '../../styles/Interactive.css'
import Footer from '../../ui/Footer';
import StripeHero from "./components/StripeHero";
import Header from '../../ui/Header';
import HowWeLearn from './components/HowWeLearn';
function Home({isDark, setIsDark}) {
 
  return (
    <main data-theme={isDark ? "dark" : "light"} className="flex flex-col items-center justify-center relative dark:bg-blackText bg-gray-100">
      
      <div  className="flex flex-col items-center justify-start w-full max-w-[1100px] min-h-screen ">

     <div className={"dark-corner-gradient"} />


      <div className="relative flex items-center justify-center z-10 w-full max-w-[1100px] px-6">
       <Header setIsDark={setIsDark} isDark={isDark}></Header>
      </div>
      <Hero></Hero>
      <p className="flex gap-2 items-center w-full px-4 mt-20 mb-6 text-gray-400 dark:text-white/60">
        <BookMarked size={18} className="text-gray-400  dark:text-white/60"></BookMarked>Tak wygląda nauka z PasjonatamiIT
      </p>
      <HowWeLearn></HowWeLearn>      
      

      <About></About>
      </div>
      <div className="flex flex-col items-center justify-start w-full bg-darkBlue dark:bg-DarkblackText banner mt-26">
      <div className="flex w-full max-w-[1100px]">
        <Interactive></Interactive>
      </div>
      </div>
      
      
      <div className="flex flex-col items-center justify-start w-full max-w-[1100px]" id="kursy">

      <Courses></Courses>
 

      
      </div>

      <div className="flex flex-col items-center justify-start w-full bg-blue-100/50 dark:bg-DarkblackBorder mt-26">
      <div className="flex w-full max-w-[1100px]">
       <AboutPlatform></AboutPlatform>
       
      </div>
      </div>


      <Reviews></Reviews>
      <StripeHero></StripeHero>
  
      <div className="flex w-full max-w-[1100px]">
       <Footer ></Footer>
       
      </div>


    </main>
  );
}

export default Home;
