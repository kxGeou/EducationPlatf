import PasswordResetForm from "../components/auth/PasswordResetForm";
import NewPassword from "../components/auth/NewPassword";
import React, { useState } from "react";
import "../styles/AuthPage.css";

function PasswordResetPage({ isDark, setIsDark }) {
  const [mode, setMode] = useState("reset");

  return (
    <div data-theme={isDark ? "dark" : "light"} className="dark:bg-blackText dark:text-white w-screen min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 relative overflow-y-auto">
      <div className={`${isDark ? "dark-corner-gradient" : "corner-gradient"}`} />

      <div className="flex flex-col justify-between items-center shadow-xl w-full max-w-[420px] px-6 py-8 sm:py-12 rounded-lg z-50 bg-white mx-auto max-h-[90vh] dark:bg-DarkblackText overflow-y-auto">
        <div className="flex flex-col items-center mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold">
            {mode === "reset" ? "Resetuj hasło" : "Ustaw nowe hasło"}
          </h2>
          <p className="text-gray-500 dark:text-white/75 font-light mt-1 text-sm sm:text-base">
            {mode === "reset"
              ? "Wprowadź swój email, aby otrzymać link resetujący"
              : "Wprowadź nowe hasło dla swojego konta"}
          </p>
        </div>

        <div className="w-full">
          {mode === "reset" ? <PasswordResetForm /> : <NewPassword />}
        </div>

        <div className="text-sm mt-6 text-center">
          {mode === "reset" && (
            <>
              Pamiętasz hasło?{" "}
              <a
                href="/authentication"
                className="text-primaryBlue underline dark:text-primaryGreen"
              >
                Zaloguj się
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PasswordResetPage;
