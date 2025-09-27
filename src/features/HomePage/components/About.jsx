import Description from '../../../components/typography/Description';
import Heading2 from '../../../components/typography/Heading2';
import SectionHeading from '../../../components/typography/SectionHeading';
import { motion, useAnimation } from "framer-motion";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Turek from '../../../assets/routerRobot.svg';

function About() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });


  return (
    <div
      ref={ref}
      aria-labelledby="about-heading"
      className="w-full mt-26 px-4 py-8 flex flex-col md:flex-row md:justify-between md:mb-16 items-center"
    >
      <div className="lg:flex md:flex-col md:w-[500px]">
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
      </div>

      <img
        src={Turek}
        alt="Ilustracja – robot z routerem symbolizujący naukę informatyki"
        className="w-[45%] hidden md:flex"
        width="400"
        height="400"
      />
    </div>
  );
}

export default About;
