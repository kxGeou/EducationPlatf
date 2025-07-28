import useWindowWidth from "../../hooks/useWindowWidth";
import supabase from "../../util/supabaseClient";
import Avatar from "boring-avatars";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function userHeader({
  userDataModal,
  setUserDataModal,
  pageChange,
  setPageChange,
}) {
  const [userEmail, setUserEmail] = useState(null);
  const width = useWindowWidth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Error fetching user", error);
        return;
      }
      setUserEmail(data.user.user_metadata.full_name);
    };

    fetchUser();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      direct: "/firstBlog",
      title: "Jak radzić sobie ze stresem",
    },
    {
      direct: "/secondBlog",
      title: "Zarządzanie emocjami w pracy",
    },
    {
      direct: "/thirdBlog",
      title: "Techniki relaksacyjne na co dzień",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="px-4"
    >
      <header
        className={`z-40 sticky top-0 bg-white text-blackText my-3 rounded-[12px] border-b border-gray-300 w-full flex justify-center py-2 px-4 lg:px-6 transition-all ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        {width >= 750 ? (
          <div className="w-full max-w-[1600px] flex justify-between items-center px-6 lg:px-0">
            <div className="flex items-center gap-4">
              <button
                aria-label="Przejdź do strony głównej"
                onClick={() => navigate("/")}
                className="font-semibold w-8 h-8 cursor-pointer rounded-full bg-primaryBlue"
              ></button>

              <nav>
                <ul className="flex items-center gap-4">
                  <li
                    className={`${
                      pageChange ? "text-primaryGreen" : "text-darkBlue"
                    } cursor-pointer transition-all hover:text-secondaryGreen`}
                    onClick={() => setPageChange(true)}
                  >
                    Twoje kursy
                  </li>
                  <li
                    className={`${
                      pageChange ? "text-darkBlue" : "text-primaryGreen"
                    } cursor-pointer transition-all hover:text-secondaryGreen`}
                    onClick={() => setPageChange(false)}
                  >
                    Zasoby
                  </li>
                </ul>
              </nav>
            </div>

            <div
              onClick={() => setUserDataModal(!userDataModal)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Otwórz dane użytkownika"
            >
              <div className="flex gap-2 items-center">
                <span className="opacity-75">{userEmail || "Użytkownik"}</span>
                <Avatar
                  name={userEmail || "Użytkownik"}
                  colors={[
                    "#0056d6",
                    "#669c35",
                    "#ffffff",
                    "#74a7fe",
                    "#cce8b5",
                  ]}
                  variant="beam"
                  size={30}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[1600px] flex justify-between items-center relative">
            <button
              onClick={() => navigate("/")}
              aria-label="Przejdź do strony głównej"
              className="font-semibold w-7 h-7 rounded-full bg-primaryBlue"
            ></button>

            <div
              className="text-darkerBlack cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
              role="button"
              tabIndex={0}
              aria-label="Przełącz menu mobilne"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </div>

            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-12 w-full -right-4 mt-3 px-5 py-6 rounded-[12px] shadow-xl bg-white z-50 space-y-6"
                >
                  <div
                    onClick={() => setUserDataModal(!userDataModal)}
                    className="cursor-pointer"
                  >
                    <h3 className="text-xs font-semibold text-gray-400 mb-1">
                      PROFIL
                    </h3>
                    <div className="flex gap-3 items-center">
                      <Avatar
                        name={userEmail || "Użytkownik"}
                        colors={[
                          "#0056d6",
                          "#669c35",
                          "#ffffff",
                          "#74a7fe",
                          "#cce8b5",
                        ]}
                        variant="beam"
                        size={36}
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {userEmail || "Użytkownik"}
                        </p>
                       
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 mb-2">
                      NAWIGACJA
                    </h3>
                    <ul className="flex flex-col gap-3">
                      <li
                        className={`${
                          pageChange ? "text-primaryGreen" : "text-darkBlue"
                        } cursor-pointer font-medium`}
                        onClick={() => {
                          setPageChange(true);
                          setMobileOpen(false);
                        }}
                      >
                        📚 Twoje kursy
                      </li>
                      <li
                        className={`${
                          pageChange ? "text-darkBlue" : "text-primaryGreen"
                        } cursor-pointer font-medium`}
                        onClick={() => {
                          setPageChange(false);
                          setMobileOpen(false);
                        }}
                      >
                        🎧 Zasoby
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                      MATERIAŁY <ChevronDown size={14} />
                    </h3>
                    <ul className="flex flex-col gap-3">
                      {navItems.map((item, index) => (
                        <li key={index}>
                          <button
                            onClick={() => {
                              navigate(item.direct);
                              setMobileOpen(false);
                            }}
                            className="w-full text-left text-sm font-medium hover:text-primaryBlue transition"
                          >
                            {item.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>
    </motion.div>
  );
}

export default userHeader;
