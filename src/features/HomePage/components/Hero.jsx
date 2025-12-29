import React, { useState } from "react";
import useWindowWidth from "../../../hooks/useWindowWidth";
import Description from '../../../components/typography/Description';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import TV from '../../../assets/telewizor.svg';

function Hero() {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const leftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col gap-5 z-8 w-full px-4 mt-38 md:mt-42"
      aria-label="Sekcja główna – kursy informatyki online"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex items-center justify-between gap-12">
        <motion.div className="flex flex-col" variants={leftVariants}>
          <motion.h1 
            className="font-extrabold text-5xl text-blackText dark:text-white lg:text-7xl md:text-5xl leading-[55px] w-full max-w-[600px] lg:leading-[75px] mb-8 md:mb-6"
            variants={leftVariants}
          >
            Od zera do zdanej informatyki
          </motion.h1>

          <motion.div variants={leftVariants}>
            <Description textColor="text-blackText mb-6 dark:text-white">
              Nasze <strong className="text-primaryBlue dark:text-primaryGreen">kursy online z informatyki</strong> przygotują Cię do 
              <strong className="text-primaryBlue dark:text-primaryGreen"> matury</strong> oraz egzaminów <strong className="text-primaryBlue dark:text-primaryGreen">INF.02</strong> i <strong className="text-primaryBlue dark:text-primaryGreen">INF.03</strong>. 
              Uczysz się krok po kroku, w prosty sposób, bez nudy i tracenia czasu.
            </Description>
            <a
              href="#kursy"
              className="bg-primaryBlue font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:bg-secondaryBlue dark:bg-primaryGreen dark:hover:bg-secondaryGreen w-full  px-12 py-3 text-white rounded-md dark:text-blackText text-center"
            >
              Zobacz kursy
            </a>
          </motion.div>
        </motion.div>

        <motion.div 
          className="relative w-full max-w-[40%] hidden lg:flex"
          variants={rightVariants}
        >
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
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Hero;
