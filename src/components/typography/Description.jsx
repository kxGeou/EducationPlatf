const Description = ({children, textColor}) => (
        <p className={`w-full max-w-[400px] ${textColor} opacity-75 text-md md:text-lg`}>{children}</p>
)

export default Description;