import { ArrowRight } from "lucide-react";
import useWindowWidth from "../hooks/useWindowWidth";

function Hero() {
  const width = useWindowWidth()
  return (
    <div className="flex flex-col gap-5 z-10 w-full px-6 mt-16">
      <div className="flex items-center justify-between gap-20">
        <div className="flex flex-col gap-6 lg:gap-10">
          <h2 className={`font-bold text-4xl leading-[40px] text-darkerBlack md:text-7xl lg:leading-[100px] lg:text-8xl md:leading-[80px] w-full max-w-[400px] md:max-w-[750px] lg:max-w-[650px] lg:font-extrabold`}>
            Lorem ipsum dolor sit amet consectetur
          </h2>

          <p className="opacity-85 text text-gray-700 w-full max-w-[450px] lg: md:max-w-[450px] text-lg">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo
            dolorem rerum corrupti enim dicta, eius doloribus deleniti tempore
            quisquam, asperiores itaque saepe at similique aliquid.
          </p>
        </div>

        <div className="w-[50%] h-[17rem] rounded shadow-lg bg-blackText text-white justify-center items-center hidden lg:flex">Prototyp</div>
      </div>

      <div className=" mt-2 flex bg-gray-100 pl-4 border border-gray-400/30 rounded-full py-[3px] w-fit pr-1">
        <input
          type="text"
          placeholder="Adres Email"
          className="focus:outline-0 placeholder:text-sm"
        />
        <button className="flex  items-center gap-2 text-white bg-blackText px-3 py-2 h-full rounded-full cursor-pointer text-sm transition-all hover:bg-[#272629]">
          Wyślij
          <ArrowRight size={14}></ArrowRight>
        </button>
      </div>
    </div>
  );
}

export default Hero;
