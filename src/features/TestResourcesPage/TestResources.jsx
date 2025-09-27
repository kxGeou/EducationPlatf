import Footer from '../../ui/Footer';
import Header from '../../ui/Header';
import Hero from "./components/Hero";
import LessonBlock from "./components/LessonBlock";
import Resources from "../../resources.json";
import { Book } from "lucide-react";
import React from "react";
import '../../styles/AuthPage.css';
function TestResources({ isDark, setIsDark }) {
  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="flex flex-col bg-gray-100"
    >
      <main className="min-h-screen flex flex-col max-w-[1100px] w-full mx-auto px-4">
        <Header setIsDark={setIsDark} isDark={isDark}></Header>

        <Hero></Hero>
        <div className="resources-corner-gradient"></div>
        <h2 className="flex items-center gap-2 mt-42 mb-6 text-lg md:text-xl text-darkBlue dark:text-white opacity-75">
          <Book size={20}></Book> Arkusze maturalne
        </h2>
        <div className="flex flex-col gap-18 mb-32">
          {Resources.map((r, index) => (
            <LessonBlock Resources={r} key={index}></LessonBlock>
          ))}
        </div>
      </main>
      <div className="flex flex-col items-center justify-start w-full ">
      <div className="flex w-full max-w-[1100px]">
       <Footer></Footer>
       
      </div>
      </div>
    </div>
  );
}

export default TestResources;
