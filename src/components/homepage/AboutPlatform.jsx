import Description from "../typography/Description";
import Heading2 from "../typography/Heading2";
import RobotLaptop from '../../assets/RobotOpieraj.svg';

function AboutPlatform() {
  return (
    <section className="w-full px-4 flex flex-col py-16 md:flex-row md:justify-between md:gap-20 lg:items-center">
     
      <img src={RobotLaptop} className="w-[40%]"/>
      <div className="my-5 flex flex-col gap-1 md:justify-between">
        <div className="flex flex-col gap-2">
          <Heading2 margin={"mb-2"} textColor={"max-w-[450px] text-darkerBlack dark:text-white"}>
            Zapisz się na zajęcia z korepetytorem!
          </Heading2>
          <Description textColor={"text-blackText dark:text-white max-w-[500px]"}>
            Nie każdy lubi uczyć się sam. Jeśli wolisz naukę z nauczycielem, który wszystko wytłumaczy Ci na bieżąco - zapraszamy na indywidualne korepetycje z informatyki.
Dostosujemy zajęcia do Twojego poziomu i celu - matura, egzamin zawodowy, poprawka lub bieżące zaległości.
          </Description>
        </div>
        <button className="mt-6 w-full bg-gradient-to-r to-primaryBlue dark:to-darkBlue from-darkBlue text-white py-2 md:py-3 rounded-[12px] cursor-pointer">
          Zapisz się już teraz
        </button>
      </div>
    </section>
  );
}

export default AboutPlatform;
