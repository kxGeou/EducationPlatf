import Description from "../typography/Description";
import Heading2 from "../typography/Heading2";
import RobotLaptop from '../../assets/RobotOpieraj.svg';
import { useNavigate } from "react-router-dom";

function AboutPlatform() {
  const navigate = useNavigate();
  return (
    <section className="w-full px-4 flex flex-col py-16 md:flex-row md:justify-between items-center md:gap-20">
      <div className="my-5 flex flex-col gap-4 md:justify-between">
        <div className="flex flex-col gap-2">
          <Heading2 margin="mb-2" textColor="max-w-[500px] text-darkerBlack dark:text-white">
            Zapisz się na zajęcia z korepetytorem!
          </Heading2>
          <Description textColor="text-blackText dark:text-white max-w-[500px]">
            Nie każdy lubi uczyć się sam. Jeśli wolisz naukę z nauczycielem, który wszystko wytłumaczy Ci na bieżąco - zapraszamy na indywidualne korepetycje z informatyki.
            Dostosujemy zajęcia do Twojego poziomu i celu - matura, egzamin zawodowy, poprawka lub bieżące zaległości.
          </Description>
        </div>
        <button className="mt-6 w-full bg-primaryBlue dark:bg-primaryGreen font-semibold text-white dark:text-blackText py-2 md:py-3 rounded-[12px] cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primaryBlue transition-transform duration-200" onClick={() => navigate("/contact")}>
          Zapisz się już teraz
        </button>
      </div>
      <img src={RobotLaptop} alt="Robot trzymający laptop" className="w-[60%] md:w-[40%] max-w-[400px]" />
    </section>
  );
}

export default AboutPlatform;
