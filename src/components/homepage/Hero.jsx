import React, { useEffect, useState } from "react";
import useWindowWidth from "../../hooks/useWindowWidth";
import Description from "../typography/Description";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import TV from '../../assets/telewizor.svg';

function Hero() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });


  return (
    <div
      ref={ref}
      className="flex flex-col gap-5 z-8 w-full px-4 mt-38 md:mt-42"
      aria-label="Sekcja główna – kursy informatyki online"
    >
      <div className="flex items-center justify-between gap-12">
        <div className="flex flex-col">
          <h1 className="font-extrabold text-5xl text-blackText dark:text-white lg:text-7xl md:text-5xl leading-[55px] w-full max-w-[600px] lg:leading-[75px] mb-8 md:mb-6">
            Od zera do zdanej informatyki
          </h1>

          <Description textColor="text-blackText mb-6 dark:text-white">
            Nasze <strong className="text-primaryBlue dark:text-primaryGreen">kursy online z informatyki</strong> przygotują Cię do 
            <strong className="text-primaryBlue dark:text-primaryGreen"> matury</strong> oraz egzaminów <strong className="text-primaryBlue dark:text-primaryGreen">INF.02</strong> i <strong className="text-primaryBlue dark:text-primaryGreen">INF.03</strong>. 
            Uczysz się krok po kroku, w prosty sposób, bez nudy i tracenia czasu.
          </Description>

          <a
            href="#kursy"
            className="bg-primaryGreen cursor-pointer transition-all duration-300 hover:scale-[1.025] hover:bg-secondaryGreen w-[75%] py-3 text-white rounded-[12px] dark:text-blackText text-center"
          >
            Zobacz kursy
          </a>
        </div>

        <div className="relative w-full max-w-[40%] hidden lg:flex">
          <img
            src={TV}
            alt="Grafika telewizora z wideo kursu informatyki"
            className="w-full h-auto"
            width="400"
            height="300"
          />
          <div className="absolute top-[13%] left-[11%] w-[78%] aspect-video rounded-[12px]">
            <iframe
              loading="lazy"
              src="https://www.youtube.com/embed/eN6olEkH2Fw"
              title="Prezentacja kursu informatyki online – Platforma XYZ"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[14rem] rounded-[14px]"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
