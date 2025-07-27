import useWindowWidth from "../../hooks/useWindowWidth";
import supabase from "../../util/supabaseClient";
import Avatar from "boring-avatars";
import { User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function userHeader({ userDataModal, setUserDataModal, pageChange, setPageChange }) {
  const [userEmail, setUserEmail] = useState("userName");
  const width = useWindowWidth();
  const navigate = useNavigate();
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log("Error fatching user", error);
      return;
    }
    setUserEmail(data.user.user_metadata.full_name);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <motion.div
            initial={{ opacity: 0,  }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
    <header className="bg-white text-blackText my-3 rounded-[12px] border-b border-gray-300 w-full flex justify-center py-3 px-6">
      <div className="w-full max-w-[1600px] flex justify-between items-center px-6 lg:px-0">
        <div className="flex items-center gap-4">
          <p className="cursor-pointer font-semibold w-8 h-8 rounded-full bg-primaryBlue" onClick={()=> navigate("/")}></p>

          <ul className="flex items-center gap-4">
            <li className={`${pageChange ? "text-primaryGreen" : "text-darkBlue"} cursor-pointer transition-all hover:text-secondaryGreen`} onClick={() => setPageChange(true)}>Twoje kursy</li>
            <li className={`${pageChange ? "text-darkBlue" : "text-primaryGreen"} cursor-pointer transition-all hover:text-secondaryGreen`} onClick={() => setPageChange(false)}>Zasoby</li>
          </ul>
        </div>
        <div onClick={() => setUserDataModal(!userDataModal)} className="cursor-pointer">
          <p className="flex gap-2 items-center">

            <span className="opacity-75">{userEmail}</span>
            
            <Avatar
              name="Mary Edwards"
              colors={["#0056d6", "#669c35", "#ffffff", "#74a7fe", "#cce8b5"]}
              variant="beam"
              size={30}
            />
          </p>
        </div>
      </div>
    </header>
</motion.div>
  );
}

export default userHeader;
