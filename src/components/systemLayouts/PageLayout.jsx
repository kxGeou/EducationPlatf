import Header from "../homepage/Header";
import Footer from "../homepage/Footer";

export default function PageLayout({ 
  children, 
  isDark, 
  setIsDark, 
  className = "",
  showFooter = true,
  maxWidth = "1100px"
}) {
  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className={`min-h-screen bg-gray-100 dark:bg-blackText text-blackText dark:text-white flex flex-col items-center ${className}`}
    >
      <Header isDark={isDark} setIsDark={setIsDark} />
      
      <main className={`w-full max-w-[${maxWidth}] px-4 mt-28 flex-1`}>
        {children}
      </main>
      
      {showFooter && (
        <div className="w-full max-w-[1100px] mt-20">
          <Footer />
        </div>
      )}
    </div>
  );
}


