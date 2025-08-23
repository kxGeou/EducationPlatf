import RobotBiurko from "../../assets/RobotBiurko.svg";
import MobileDesktop from "../../assets/logoMobile.svg";
import { ChevronRight } from "lucide-react";
import React from "react";

function HeroBlog() {
  return (
    <section className="w-full flex justify-between items-center mb-36 mt-10 sm:mt-0 px-4">
      <div>
        <img className="w-13 mb-4" src={MobileDesktop}></img>
        <div className="flex flex-col items-start text-5xl md:text-7xl">
          <p className="text-blackText/75 font-thin dark:text-white/75">
            Wiedza
          </p>
          <p className="font-bold text-blackText dark:text-white">
            która naprawdę
          </p>
          <p className="font-bold text-blackText dark:text-white">
            się przydaje
          </p>
        </div>
        <p className="w-full max-w-[500px] dark:text-white/80 mt-6 text-blackText/75 leading-[26px] md:leading-[28px] md:text-lg">
          Na blogu dzielimy się sprawdzonymi poradami, analizami zadań i
          strategiami nauki, które ułatwią przygotowanie do matury i egzaminów
          zawodowych z informatyki.
        </p>
        <button className="flex items-center gap-1 text-white mt-6 md:text-lg cursor-pointer  rounded-[12px] px-4 py-[6px] bg-secondaryBlue dark:bg-secondaryGreen">
          Zobacz blogi <ChevronRight size={20}></ChevronRight>
        </button>
      </div>
      <img
        src={RobotBiurko}
        alt="Robot siedzacy przy biurku"
        className="w-[45%] hidden md:flex"
      />
    </section>
  );
}

export default HeroBlog;
