import MobileDesktop from "../../../assets/logoMobile.png";
import { ChevronDown } from "lucide-react";
import React from "react";

function HeroBlog({ hero_title, hero_description, hero_image }) {
  return (
    <section className="w-full flex justify-between items-center mb-36 mt-32 gap-12">
      <div>
        <img className="w-42 mb-4" src={MobileDesktop}></img>
        <p className="font-bold text-blackText dark:text-white text-4xl md:text-6xl">{hero_title}</p>
        <p className="w-full max-w-[500px] dark:text-white/75 mt-6 text-blackText/75 leading-[26px] md:leading-[28px] md:text-lg">
          {hero_description}
        </p>
        <button className="flex items-center gap-1 text-white mt-6 md:text-lg cursor-pointer  rounded-[12px] px-4 py-[6px] bg-secondaryBlue dark:bg-secondaryGreen">
          Czytaj dalej <ChevronDown size={20}></ChevronDown>
        </button>
      </div>
      <img
        className="md:flex hidden w-[40%] dark:bg-DarkblackText h-80  rounded-[12px] text-white items-center justify-center"
        src={hero_image}
      ></img>
    </section>
  );
}

export default HeroBlog;
