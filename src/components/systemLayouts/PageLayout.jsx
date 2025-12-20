import Header from "../../ui/Header";
import Footer from "../../ui/Footer";

export default function PageLayout({ 
  children, 
  isDark, 
  setIsDark, 
  from = "#5e91ff",          // kolor początkowy (jasny)
  fromDark = "#15316b",      // kolor początkowy (ciemny)
  to = "#f3f4f6",            // kolor końcowy
  toDark = "#0a2540",        // kolor końcowy w dark mode
  stopAt = "30%",            // gdzie gradient ma się kończyć
  className = "",
  showFooter = true,
  maxWidth = "1100px"
}) {

  // Tworzymy gradient zależny od trybu (od prawego górnego rogu do lewego dolnego)
  const gradient = isDark
    ? `linear-gradient(to bottom left, ${fromDark} 0%, ${toDark} ${stopAt})`
    : `linear-gradient(to bottom left, ${from} 0%, ${to} ${stopAt})`;

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      style={{ background: gradient }}
      className={`text-blackText dark:text-white flex flex-col items-center min-h-screen ${className}`}
    >
      <Header isDark={isDark} setIsDark={setIsDark} />

      <main className={`w-full max-w-[${maxWidth}] px-4 flex-1`}>
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
