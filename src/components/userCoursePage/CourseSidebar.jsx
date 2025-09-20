import MobileLogo from "../../assets/logoMobile.svg";
import DesktopLogo from "../../assets/logoDesk.png";
import WhiteLogo from "../../assets/logo_biale.svg";
import UserPanel from "./UserPanel";
import {
  ChartColumnBig,
  Clapperboard,
  Moon,
  NotepadText,
  SearchCode,
  SidebarClose,
  Sun,
  Undo2,
  Menu,
  X,
  Notebook,
  ListTodo,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseSidebar({
  user,
  isDark,
  setIsDark,
  activeSection,
  setActiveSection,
  userDataModal,
  setUserDataModal,
}) {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: <SearchCode size={20} />, label: "Informacje", key: "info" },
    { icon: <Clapperboard size={20} />, label: "Wideo", key: "video" },
    { icon: <NotepadText size={20} />, label: "Fiszki", key: "flashcards" },
    { icon: <ChartColumnBig size={20} />, label: "Postęp", key: "chart" },
    { icon: <ListTodo size={20} />, label: "Zadania", key: "tasks" },
    { icon: <Undo2 size={20} />, label: "Powrót", key: "back", highlight: true, action: () => navigate("/user_page") },
  ];

  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem("theme", newValue ? "dark" : "light");
      return newValue;
    });
  };

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 rounded-[12px] bg-white dark:bg-DarkblackBorder shadow-md">
        <a href="/">
          <img src={MobileLogo} alt="Logo" className="w-10" />
        </a>
        {mobileMenuOpen ? 
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <X size={35} className="text-secondaryBlue dark:text-secondaryGreen" />
        </button>
        :
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={35} className="text-secondaryBlue dark:text-secondaryGreen" />
        </button>
      }
        
      </header>

      <div
        className={`md:hidden fixed top-0 left-0 w-full h-full bg-black/50 z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside
        className={`md:hidden fixed top-0 left-0 w-64 h-full bg-white dark:bg-DarkblackBorder  z-50 flex flex-col justify-between p-4 shadow-lg transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
            <img src={MobileLogo} alt="Logo" className="w-10 mb-6 mt-4" />
          <div className="flex flex-col gap-3">
            {menuItems.map(item => (
              <SidebarButton
                key={item.key}
                icon={item.icon}
                label={item.label}
                expanded={true}
                active={activeSection === item.key}
                highlight={item.highlight}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (item.action) item.action();
                  else setActiveSection(item.key);
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <div
            onClick={toggleTheme}
            className="cursor-pointer flex items-center justify-center gap-2 py-3 px-3 bg-secondaryBlue text-white rounded-lg dark:bg-secondaryGreen"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>Tryb {isDark ? "jasny" : "ciemny"}</span>
          </div>
          <UserPanel
            user={user}
            isDark={isDark}
            setIsDark={setIsDark}
            setUserDataModal={setUserDataModal}
            userDataModal={userDataModal}
            showSidebar={true}
          />
        </div>
      </aside>


      {/* DESKTOP */}

      <aside
        data-theme={isDark ? "dark" : "light"}
        className={`
          hidden md:flex h-[98vh] rounded-[12px] bg-white dark:bg-DarkblackBorder shadow-md
          flex-col justify-between p-4 transition-all duration-300 overflow-hidden sticky top-0 
          ${showSidebar ? "w-[17.5rem]" : "w-[4.5rem]"}
        `}
      >
        <div>
          <nav className="flex flex-col items-center justify-center gap-2">
            <div className="flex justify-between items-center w-full">
              <img
                src={
                  isDark
                    ? (showSidebar ? WhiteLogo : MobileLogo)
                    : (showSidebar ? DesktopLogo : MobileLogo)
                }

                className={` ${showSidebar ? "mb-0 w-30" : "mb-2 w-9"} transition-all duration-300`}
              />
              {showSidebar && (
                <button onClick={() => setShowSidebar(!showSidebar)}>
                  <SidebarClose className=" cursor-pointer text-blackText dark:text-white" size={20} />
                </button>
              )}
            </div>
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center justify-center gap-2 w-full py-2 transition-colors"
              >
                <SidebarClose className="text-secondaryBlue dark:text-secondaryGreen" />
              </button>
            )}
            <hr className={` text-secondaryBlue/25 mt-2 mb-3 h-[0.5px] w-full`} />
            <div className={`flex flex-col  ${showSidebar ? "w-full gap-3" : "gap-6 "}`}>
              {menuItems.map(item => (
                <SidebarButton
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  active={activeSection === item.key}
                  expanded={showSidebar}
                  highlight={item.highlight}
                  onClick={() => {
                    if (item.action) item.action();
                    else setActiveSection(item.key);
                  }}
                />
              ))}
            </div>
          </nav>
        </div>
        <div className="flex flex-col gap-1 items-center w-full">
          {!showSidebar && <hr className="text-secondaryBlue/50 mb-4 h-[1px] w-full" />}
         
          <UserPanel
            user={user}
            isDark={isDark}
            setIsDark={setIsDark}
            setUserDataModal={setUserDataModal}
            userDataModal={userDataModal}
            showSidebar={showSidebar}
          />
           <div
            onClick={toggleTheme}
            className={`cursor-pointer mt-3 mb-3 transition-all ${
              showSidebar && "bg-secondaryBlue w-full py-3 flex items-center justify-center text-white rounded-[12px]"
            }`}
            title="Przełącz tryb jasny/ciemny"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarButton({ icon, label, expanded, active, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center  transition-all duration-300 cursor-pointer
        ${expanded ? "justify-start gap-1 py-1" : "justify-center"}
        ${active ? ` dark:text-primaryGreen text-primaryBlue ${expanded && " border-l-6 pl-3"}` : ""}
        ${highlight ? "" : ""}`}
    >
      {icon}
      {expanded && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
