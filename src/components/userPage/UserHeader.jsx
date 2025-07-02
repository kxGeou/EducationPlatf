import useWindowWidth from "../../hooks/useWindowWidth";
import supabase from "../../util/supabaseClient";
import Avatar from "boring-avatars";
import { User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function userHeader({ userDataModal, setUserDataModal }) {
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
    <header className="bg-white border-b border-gray-300 w-full flex justify-center py-3 px-6">
      <div className="w-full max-w-[1600px] flex justify-between items-center px-6 lg:px-0">
        <div className="flex items-center gap-4">
          <p className="cursor-pointer font-semibold" onClick={()=> navigate("/")}>Strona główna</p>
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
  );
}

export default userHeader;
