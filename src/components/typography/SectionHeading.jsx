import { ChevronRight } from "lucide-react";
import '../../styles/arrowAnimation.css';
const SectionHeading = ({ children, textColor }) => (
  <span
    className={`md:text-lg font-semibold flex items-center gap-1 ${textColor} mb-3 `}
  >
    <ChevronRight className="arrowAnimation" size={20}></ChevronRight>
    {children}

  </span>
);

export default SectionHeading;
