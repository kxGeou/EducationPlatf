import useWindowWidth from "../../hooks/useWindowWidth";
import supabase from "../../util/supabaseClient";
import { ChevronRight, Menu, XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const [visibleModal, setVisibleModal] = useState(false);
  const width = useWindowWidth();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log("Error fatching user", error);
      return;
    }
    setUserEmail(data.user.email);
  };
  function toggleModal() {
    if (width > 800) {
      setVisibleModal(false);
    }

    setVisibleModal(!visibleModal);
  }
  useEffect(() => {
    fetchUser();
  }, []);


  return (
    <header className="relative flex justify-between w-full item-scenter py-6 px-6 z-100">
      <div className="bg-white h-8 w-8 mr-6"></div>
      {width < 800 ? (
        <div
          className={`absolute  right-5 bg-white/30 border border-white/20 flex flex-col justify-center items-start rounded-lg  py-1 px-3 ${
            visibleModal
              ? "py-4 px-5 backdrop-blur-sm text-left w-full max-w-[15rem]"
              : null
          }`}
        >
          <div className="flex w-full items-center justify-end">
            {visibleModal ? (
              <XIcon
                onClick={() => toggleModal()}
                className="text-white cursor-pointer "
              ></XIcon>
            ) : (
              <Menu
                onClick={() => toggleModal()}
                className="text-white cursor-pointer"
              ></Menu>
            )}
          </div>
          {visibleModal ? (
            <div className="flex flex-col gap-3 text-white text-lg mt-3">
              <p className="transition-all hover:text-blue-600 cursor-pointer">
                O nas
              </p>
              <p className="transition-all hover:text-blue-600 cursor-pointer">
                Osiągnięcia
              </p>
              <p className="transition-all hover:text-blue-600 cursor-pointer">
                Kursy
              </p>
              <p className="transition-all hover:text-blue-600 cursor-pointer">
                Opinie
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="w-full flex justify-between items-center">
          <ul className="flex gap-6 text-white font-semibold w-full items-center">
            <li className="transition-all hover:text-white/75 cursor-pointer">
              O nas
            </li>
            <li className="transition-all hover:text-white/75 cursor-pointer">
              Osiągnięcia
            </li>
            <li className="transition-all hover:text-white/75 cursor-pointer">
              Kursy
            </li>
            <li className="transition-all hover:text-white/75 cursor-pointer">
              Opinie
            </li>
          </ul>

          {userEmail ? (
              <span
                className=" flex gap-2 text-white items-center justify-end font-semibold w-40 cursor-pointer transition-all hover:text-white/75"
                onClick={() => navigate("/myCourses")}
              >
                {userEmail}
              </span>
          ) : (
          
              <span
              className=" flex gap-2 text-white items-center justify-end font-semibold w-40 cursor-pointer transition-all hover:text-white/75"
              onClick={() => navigate("/login-register")}
            >
              Zaloguj się <ChevronRight size={18}></ChevronRight>
            </span>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
