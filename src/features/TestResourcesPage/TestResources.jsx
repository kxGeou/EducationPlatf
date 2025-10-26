import Footer from '../../ui/Footer';
import Header from '../../ui/Header';
import Hero from "./components/Hero";
import LessonBlock from "./components/LessonBlock";
import Resources from "../../resources.json";
import { Book } from "lucide-react";
import React from "react";
import '../../styles/AuthPage.css';
import PageLayout from '../../components/systemLayouts/PageLayout';
function TestResources({ isDark, setIsDark }) {
  return (
    <PageLayout
     isDark={isDark} 
      setIsDark={setIsDark}
      from="#946eff"
  fromDark="#391f82" stopAt="8%"
    >

        <Hero></Hero>
        <h2 className="flex items-center gap-2 mt-42 mb-6 text-lg md:text-xl text-darkBlue dark:text-white opacity-75">
          <Book size={20}></Book> Arkusze maturalne
        </h2>
        <div className="flex flex-col gap-18 mb-32">
          {Resources.map((r, index) => (
            <LessonBlock Resources={r} key={index}></LessonBlock>
          ))}
        </div>
      <div className="flex flex-col items-center justify-start w-full ">
      </div>
    </PageLayout>
  );
}

export default TestResources;
