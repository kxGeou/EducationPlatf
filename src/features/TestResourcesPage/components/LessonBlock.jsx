import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

function LessonBlock({ Resources }) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <div className="w-full">
      <div
        className="w-full h-3 rounded-2xl mb-1 shadow-md"
        style={{
          background: `linear-gradient(to right, ${Resources.colors[0]}, ${Resources.colors[1]})`,
        }}
      ></div>
      <motion.div
        className="w-full shadow-lg rounded-2xl bg-white text-darkBlue dark:bg-DarkblackText bg:text-white"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <h3 className="text-2xl font-semibold dark:text-white">{Resources.title}</h3>
        {Resources.resource.map((r, index) => (
          <ReSection
            key={index}
            ReSection={r}
            Color={Resources.colors[0]}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        ))}
        </div>
      </motion.div>
    </div>
  );
}

function ReSection({ ReSection, Color, activeDropdown, setActiveDropdown }) {
  const isMobile = useIsMobile();

  const handleClick = (pdfUrl) => {
    if (pdfUrl) window.open(pdfUrl, "_blank");
  };

  return (
    <motion.div
      className="w-full mt-8 flex md:flex-row md:gap-6 md:items-center flex-col dark:text-white"
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <p className="mb-4 md:mb-0 font-medium">{ReSection.resTitle}</p>
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {ReSection.section.map((s, index) =>
            s.subSections ? (
              <DropdownButton
                key={index}
                title={s.title}
                options={s.subSections}
                color={Color}
                dropdownKey={`${ReSection.resTitle}-${s.title}-${index}`}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            ) : (
              <button
                key={index}
                onClick={() => handleClick(s.pdfUrl)}
                className="w-full p-2 rounded-xl cursor-pointer text-white shadow"
                style={{ background: Color }}
              >
                {s.title}
              </button>
            )
          )}
        </div>
      ) : (
        <div className="flex items-center gap-6 flex-wrap">
          {ReSection.section.map((s, index) =>
            s.subSections ? (
              <DropdownButton
                key={index}
                title={s.title}
                options={s.subSections}
                color={Color}
                dropdownKey={`${ReSection.resTitle}-${s.title}-${index}`}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            ) : (
              <button
                key={index}
                onClick={() => handleClick(s.pdfUrl)}
                className="cursor-pointer transition-all duration-300 hover:scale-[1.05] text-white flex items-center justify-center px-8 py-3 rounded-xl"
                style={{ background: Color }}
              >
                {s.title}
              </button>
            )
          )}
        </div>
      )}
    </motion.div>
  );
}

function DropdownButton({ title, options, color, dropdownKey, activeDropdown, setActiveDropdown }) {
  const isOpen = activeDropdown === dropdownKey;
  const dropdownRef = React.useRef(null);

  const handleToggle = () => {
    // Toggle dropdown on click
    if (isOpen) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownKey);
    }
  };

  const handleSelect = (pdfUrl) => {
    window.open(pdfUrl, "_blank");
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, setActiveDropdown]);

  return (
    <div 
      ref={dropdownRef}
      className="relative"
    >
      <button
        onClick={handleToggle}
        className="cursor-pointer w-full transition-all duration-300 hover:scale-[1.05] text-white flex items-center justify-center gap-2 px-8 py-3 rounded-xl"
        style={{ background: color }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {title}
        <ChevronDown 
          size={18} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <motion.div
          className="absolute z-20 mt-2 w-full rounded-xl shadow-lg"
          style={{ background: color }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(opt.pdfUrl)}
              className="block w-full p-4 text-left hover:bg-black/20 cursor-pointer rounded-xl text-sm text-white transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default LessonBlock;
