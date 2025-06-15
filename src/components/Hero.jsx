import { ArrowRight } from "lucide-react";

function Hero() {
  return (
    <div className="flex flex-col gap-5 z-10 w-full px-6 mt-8">
      <div className="flex flex-col gap-10">
        <h2 className="font-bold text-4xl leading-[40px] text-black">
          Lorem ipsum dolor sit amet consectetur adipisicing elit
        </h2>

        <p className="opacity-75 text text-gray-700">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo
          dolorem rerum corrupti enim dicta, eius doloribus deleniti tempore
          quisquam, asperiores itaque saepe at similique aliquid.
        </p>
      </div>

      <div className="mt-2 flex bg-gray-100 pl-4 border border-gray-500/30 rounded-full w-fit">
        <input
          type="text"
          placeholder="Adres Email"
          className="focus:outline-0 placeholder:text-sm"
        />
        <button className="flex items-center gap-2 text-white bg-[#1a1a1c] px-6 py-2 rounded-full cursor-pointer text-sm transition-all hover:bg-[#272629]">
          Wyślij
          <ArrowRight size={14}></ArrowRight>
        </button>
      </div>
    </div>
  );
}

export default Hero;
