import Avatar from "boring-avatars";
import { useEffect, useState } from "react";

export default function UserPanel({ user, setIsDark, isDark, userDataModal, setUserDataModal }) {
  const userName = user?.user_metadata?.full_name || "Użytkownik";
  const userEmail = user?.user_metadata?.email || "Email Użytkownika";
 

  return (
    <div className="dark:bg-DarkblackBorder rounded-t-[12px] py-4 px-4">
      <div className="flex flex-col items-start gap-4 ">
        <h3 className="text-sm text-gray-400">Dane użytkownika</h3>
        <div className="flex items-center gap-4">
        <Avatar
          name={userName}
          colors={["#0056d6", "#669c35", "#ffffff", "#74a7fe", "#cce8b5"]}
          variant="beam"
          size={50}
          className="cursor-pointer hover:scale-[1.025]"
          onClick={() => setUserDataModal((prev) => (!prev))}
        />
        <div>
          <p className="text-lg font-semibold">{userName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {userEmail}
          </p>
        </div>
        </div>

      </div>
    </div>
  );
}
