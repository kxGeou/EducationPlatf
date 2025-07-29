import React, { useEffect } from "react";
import useWindowWidth from "../../hooks/useWindowWidth";
import Description from "../typography/Description";
import { ArrowRight } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
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
      className="flex flex-col gap-5 z-8 w-full px-6 mt-32"
    >
      <div className="flex items-center justify-between gap-20">
        <div className="flex flex-col gap-3 lg:gap-6">
          <h2
            className="font-bold text-4xl text-darkerBlack lg:text-6xl  leading-[45px] w-full max-w-[400px] lg:leading-[65px] md:max-w-[750px] lg:max-w-[700px] lg:font-extrabold"
          >
            Zdaj maturę z informatyki bez stresu — z nami to naprawdę proste!
          </h2>

          <Description textColor={"text-textBlack"}>
          Nauka informatyki nie musi być trudna. Nasze kursy online prowadzą Cię krok po kroku, dzięki czemu opanujesz wszystko, co potrzebne na maturę — bez nudy i bez przepalania czasu. Gwarantujemy, że zrozumiesz nawet najtrudniejsze tematy.
          </Description>
        </div>

        <div className="w-[50%] h-[17rem] rounded-[12px] shadow-lg bg-blackText text-white justify-center items-center hidden lg:flex">
          Prototyp
        </div>
      </div>
    </motion.div>
  );
}

export default Hero;
