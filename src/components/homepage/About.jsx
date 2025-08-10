import Description from "../typography/Description";
import Heading2 from "../typography/Heading2";
import SectionHeading from "../typography/SectionHeading";
import { motion, useAnimation } from "framer-motion";
import React from "react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Turek from '../../assets/routerRobot.svg';
function About() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={sectionVariants}
      className="w-full mt-26  px-4 py-8 flex flex-col md:flex-row md:justify-between md:mb-16 items-center"
    >
      <div className="lg:flex md:flex-col md:w-[500px]">
        <SectionHeading
          textColor={"text-secondaryBlue dark:text-secondaryGreen"}
        >
          Z pasji do informatyki
        </SectionHeading>
        <div className="flex flex-col gap-2">
          <Heading2
            margin={"mb-2"}
            textColor={"text-blackText dark:text-white"}
          >
            Informatyka to nasza <span className="text-primaryGreen">pasja</span>  Twoje egzaminy to nasz cel
          </Heading2>
          <Description textColor={"text-blackText dark:text-white"}>
            Od ponad 5 lat pomagamy uczniom świetnie zdać egzaminy z informatyki.
            Łączymy praktykę z indywidualnym podejściem, tłumacząc nawet trudne
            tematy w prosty sposób. Nasze kursy to uporządkowana, skuteczna
            ścieżka bez zbędnej teorii i stresu – z gwarancją efektów.
          </Description>
        </div>
      </div>
      <img src={Turek} className="w-[45%]  hidden md:flex"/>
    </motion.section>
  );
}

export default About;
