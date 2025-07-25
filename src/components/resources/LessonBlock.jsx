import React, { useState } from "react";
import { motion } from "framer-motion";

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

function LessonBlock({ Resources }) {
  return (
   <motion.div
  className="w-full shadow-lg rounded-[12px] bg-white text-darkBlue"
  initial={{ opacity: 0, y: 0 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
      <div
        className="w-full h-3 rounded-t-[12px]"
        style={{
          background: `linear-gradient(to right, ${Resources.colors[0]}, ${Resources.colors[1]})`,
        }}
      ></div>
      <div className="p-6">
        <div>
          <h3 className="text-2xl font-semibold">{Resources.title}</h3>
          {Resources.resource.map((r, index) => (
            <ReSection ReSection={r} key={index} Color={Resources.colors[0]} />
          ))}
        </div>
      </div>
   </motion.div>
  );
}

function ReSection({ ReSection, Color }) {
  const isMobile = useIsMobile();

  const handleClick = (pdfUrl) => {
    if (pdfUrl) window.open(pdfUrl, "_blank");
  };

  return (
    <motion.div
  className="w-full mt-8 flex md:flex-row md:gap-6 md:items-center flex-col"
  initial={{ opacity: 0, y: 0 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.1 }}
>
      <p className="mb-4 md:mb-0">{ReSection.resTitle}</p>
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {ReSection.section.map((s, index) => (
            <button
              key={index}
              onClick={() => handleClick(s.pdfUrl)}
              className="w-full p-2 rounded-[12px] cursor-pointer text-white shadow"
              style={{
                background : Color
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-6 flex-wrap">
          {ReSection.section.map((s, index) => (
            <button
              key={index}
              onClick={() => handleClick(s.pdfUrl)}
              className="cursor-pointer transition-all duration-300 hover:scale-[1.05] text-white flex items-center justify-center px-8 py-2 rounded-[12px]"
              style={{ background: Color }}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}
   </motion.div>
  );
}


export default LessonBlock;
