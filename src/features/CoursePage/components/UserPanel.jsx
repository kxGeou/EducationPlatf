import Avatar from "boring-avatars";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { Star } from "lucide-react";

export default function UserPanel({ user, setIsDark, isDark, showSidebar, setActiveSection }) {
  const userName = user?.user_metadata?.full_name || "Użytkownik";
  const userEmail = user?.user_metadata?.email || "Email Użytkownika";
  const userPoints = useAuthStore((state) => state.userPoints);
 

  return (
    <div className="dark:bg-DarkblackBorder w-full">
      <div className="flex flex-col items-start gap-4 w-full">
        <div className="flex items-center gap-2">
          <Avatar
            name={userName}
            colors={["#0056d6", "#669c35", "#ffffff", "#74a7fe", "#cce8b5"]}
            variant="beam"
            size={30}
            className="cursor-pointer"
            onClick={() => setActiveSection("profile")}
          />
          
          {showSidebar && (
            <div 
              onClick={() => setActiveSection("profile")}
              className="cursor-pointer flex flex-col items-start"
            >
              <p className="text-sm font-medium">{userName}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {userPoints || 0} pkt
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
