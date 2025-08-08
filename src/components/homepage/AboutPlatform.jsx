import Description from "../typography/Description";
import Heading2 from "../typography/Heading2";
import RobotLaptop from '../../assets/RobotLaptop.svg';

function AboutPlatform() {
  return (
    <section className="w-full px-4 flex flex-col py-16 md:flex-row md:justify-between md:gap-20 lg:items-center">
     
      <img src={RobotLaptop} className="w-[15%]"/>
      <div className="my-5 flex flex-col gap-1 md:justify-between">
        <div className="flex flex-col gap-2">
          <Heading2 margin={"mb-2"} textColor={"text-darkerBlack dark:text-white"}>
            Lorem ipsum dolor sit amet.
          </Heading2>
          <Description textColor={"text-blackText dark:text-white"}>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptas,
            laboriosam? Libero, similique dolorum porro molestiae explicabo
            velit minus quia ab?
          </Description>
        </div>
        <button className="mt-6 w-full bg-gradient-to-r to-primaryBlue dark:to-darkBlue from-darkBlue text-white py-2 md:py-3 rounded-[12px] cursor-pointer">
          Kup Kurs
        </button>
      </div>
    </section>
  );
}

export default AboutPlatform;
