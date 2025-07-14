import useWindowWidth from "../../hooks/useWindowWidth";
import Description from "../typography/Description";
import { ArrowRight } from "lucide-react";

function Hero() {
  const width = useWindowWidth();
  return (
    <div className="flex flex-col gap-5 z-8 w-full px-6 mt-26">
      <div className="flex items-center justify-between gap-20">
        <div className="flex flex-col gap-6 lg:gap-10">
          <h2
            className={`font-bold text-4xl leading-[40px] text-darkerBlack md:text-7xl lg:leading-[100px] lg:text-8xl md:leading-[80px] w-full max-w-[400px] md:max-w-[750px] lg:max-w-[650px] lg:font-extrabold`}
          >
            Lorem ipsum dolor sit amet consectetur
          </h2>

          <Description textColor={"text-textBlack"}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo
            dolorem rerum corrupti enim dicta, eius doloribus deleniti tempore
            quisquam, asperiores itaque saepe at similique aliquid.
          </Description>
        </div>

        <div className="w-[50%] h-[17rem] rounded-[12px] shadow-lg bg-blackText text-white justify-center items-center hidden lg:flex">
          Prototyp
        </div>
      </div>

    
    </div>
  );
}

export default Hero;
