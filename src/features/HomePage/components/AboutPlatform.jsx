import { motion } from "framer-motion";
import Description from '../../../components/typography/Description';
import Heading2 from '../../../components/typography/Heading2';
import RobotLaptop from '../../../assets/RobotOpieraj.svg';
import { useNavigate } from "react-router-dom";

function AboutPlatform() {
  const navigate = useNavigate();

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
    <section className="w-full px-4 flex flex-col py-16 md:flex-row md:justify-between items-center md:gap-20">
      <motion.div
        className="my-5 flex flex-col gap-4 md:justify-between"
        variants={leftVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col gap-2">
          <Heading2 margin="mb-2" textColor="max-w-[500px] text-darkerBlack dark:text-white">
            Zapisz się na zajęcia z korepetytorem!
          </Heading2>
          <Description textColor="text-blackText dark:text-white max-w-[500px]">
            Nie każdy lubi uczyć się sam. Jeśli wolisz naukę z nauczycielem, który wszystko wytłumaczy Ci na bieżąco - zapraszamy na indywidualne korepetycje z informatyki.
            Dostosujemy zajęcia do Twojego poziomu i celu - matura, egzamin zawodowy, poprawka lub bieżące zaległości.
          </Description>
        </div>
        <button className="mt-6 w-full bg-primaryBlue dark:bg-primaryGreen font-semibold text-white dark:text-blackText py-2 md:py-3 rounded-xl cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primaryBlue transition-transform duration-200 shadow-lg hover:shadow-xl" onClick={() => navigate("/contact")}>
          Zapisz się już teraz
        </button>
      </motion.div>
      <motion.img
        src={RobotLaptop}
        alt="Robot trzymający laptop"
        className="w-[60%] md:w-[40%] max-w-[400px]"
        variants={rightVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      />
    </section>
  );
}

export default AboutPlatform;
