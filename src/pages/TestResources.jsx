import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";
import Hero from "../components/resources/Hero";
import LessonBlock from "../components/resources/LessonBlock";
import Resources from "../resources.json";
import { Book } from "lucide-react";
import React from "react";

function TestResources({ isDark, setIsDark }) {
  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="flex flex-col bg-gradient-to-br to-50% from-secondaryBlue/50 to-gray-100 dark:from-blackText dark:to-blackText"
    >
      <main className="min-h-screen flex flex-col max-w-[1100px] w-full mx-auto px-6">
        <Header setIsDark={setIsDark} isDark={isDark}></Header>

        <Hero></Hero>

        <h2 className="flex items-center gap-2 mt-28 mb-6 text-lg md:text-xl text-darkBlue dark:text-white opacity-75">
          <Book size={20}></Book> Arkusze maturalne
        </h2>
        <div className="flex flex-col gap-18 mb-32">
          {Resources.map((r, index) => (
            <LessonBlock Resources={r} key={index}></LessonBlock>
          ))}
        </div>
      </main>
      <div className="flex flex-col items-center justify-start w-full bg-white dark:bg-DarkblackText dark:border-DarkblackBorder border-t border-gray-300 mt-26">
      <div className="flex w-full max-w-[1100px]">
       <Footer></Footer>
       
      </div>
      </div>
    </div>
  );
}

export default TestResources;
