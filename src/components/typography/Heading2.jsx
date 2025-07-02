const Heading2 = ({ children, textColor, margin }) => (
  <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold ${textColor} ${margin} leading-[30px] md:leading-[35px] lg:leading-[45px]`}>{children}</h2>
);

export default Heading2;
