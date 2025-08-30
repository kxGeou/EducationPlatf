import { ChevronRight } from "lucide-react";
const SectionHeading = ({ children, textColor }) => (
  <span
    className={`md:text-lg font-semibold flex items-center gap-1  mb-3 ${textColor}`}
  >
    <ChevronRight size={20}></ChevronRight>
    {children}

  </span>
);

export default SectionHeading;
