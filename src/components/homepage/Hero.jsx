import React, { useEffect } from "react";
import useWindowWidth from "../../hooks/useWindowWidth";
import Description from "../typography/Description";
import { ArrowRight } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import TV from '../../assets/telewizor.svg';
function Hero() {
  const width = useWindowWidth();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={heroVariants}
      className="flex flex-col gap-5 z-8 w-full px-4 mt-32 md:mt-42"
    >
      <div className="flex items-center justify-between gap-12">
        <div className="flex flex-col">
          <h2
            className="font-bold text-4xl text-darkerBlack dark:text-white lg:text-7xl md:text-5xl  leading-[45px] w-full max-w-[400px] lg:leading-[75px] md:max-w-[750px] lg:max-w-[600px] lg:font-extrabold mb-4"
          >
            Zdaj maturę z informatyki bez stresu
          </h2>

          <Description textColor={"text-blackText mb-6 dark:text-white"}>
          Nauka informatyki nie musi być trudna. Nasze kursy online prowadzą Cię krok po kroku, dzięki czemu opanujesz wszystko, co potrzebne na maturę — bez nudy i bez przepalania czasu.
          </Description>
          <button className="bg-primaryGreen  cursor-pointer transition-all duration-300 hover:scale-[1.025] hover:bg-secondaryGreen w-[75%] py-3 text-white rounded-[12px] dark:text-blackText">Zobacz kursy</button>
        </div>
        {/* <div className="w-[50%] h-[17rem] rounded-[12px] shadow-lg bg-blackText dark:bg-DarkblackText text-white justify-center items-center hidden lg:flex">
          Prototyp
        </div> */}
        <img src={TV}  className="w-full max-w-[40%] hidden lg:flex "/>
      </div>
    </motion.div>
  );
}

export default Hero;
