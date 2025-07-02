const SectionHeading = ({ children, textColor }) => (
  <span
    className={`md:text-lg font-semibold ${textColor} mb-3 `}
  >
    {children}
  </span>
);

export default SectionHeading;
