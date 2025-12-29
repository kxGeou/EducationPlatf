import Description from '../../../components/typography/Description';
import Heading2 from '../../../components/typography/Heading2';
import SectionHeading from '../../../components/typography/SectionHeading';
import { motion } from "framer-motion";
import React from "react";
import Turek from '../../../assets/routerRobot.svg';

function About() {

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
      aria-labelledby="about-heading"
      className="w-full mt-26 px-4 py-8 flex flex-col md:flex-row md:justify-between md:mb-16 items-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
    >
      <motion.div 
        className="lg:flex md:flex-col md:w-[500px]"
        variants={leftVariants}
      >
        <SectionHeading
          textColor={"text-secondaryBlue dark:text-secondaryGreen"}
        >
          Z pasji do informatyki
        </SectionHeading>

        <div className="flex flex-col gap-2">
          <Heading2
            id="about-heading"
            margin={"mb-2"}
            textColor={"text-blackText dark:text-white"}
          >
            Informatyka to nasza <span className="text-primaryGreen">pasja </span> 
            Twoje egzaminy to nasz cel
          </Heading2>

          <Description textColor={"text-blackText dark:text-white"}>
            Od ponad 5 lat pomagamy uczniom zdać <strong className="text-primaryBlue dark:text-primaryGreen">maturę z informatyki </strong> 
             oraz egzaminy zawodowe <strong className="text-primaryBlue dark:text-primaryGreen">INF.02 i INF.03</strong>.  
            Łączymy praktykę z indywidualnym podejściem – tłumacząc nawet trudne 
            tematy prostym językiem.  
            Nasze <strong className="text-primaryBlue dark:text-primaryGreen">kursy online z informatyki</strong> to uporządkowana, skuteczna
            ścieżka bez zbędnej teorii i stresu – z gwarancją efektów.
          </Description>
        </div>
      </motion.div>

      <motion.img
        src={Turek}
        alt="Ilustracja – robot z routerem symbolizujący naukę informatyki"
        className="w-[45%] hidden md:flex"
        width="400"
        height="400"
        variants={rightVariants}
      />
    </motion.div>
  );
}

export default About;
