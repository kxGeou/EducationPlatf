import LoginForm from "./components/LoginForm.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import React, { useState } from "react";
import "../../styles/AuthPage.css";

function AuthPage({isDark, setIsDark}) {
  const [mode, setMode] = useState("login");

  return (
    <div data-theme={isDark ? "dark" : "light"} className="dark:bg-blackText dark:text-white w-screen min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 relative overflow-y-auto">
          <div className={`${isDark ? "dark-corner-gradient" : "corner-gradient"}`} />


      <div className="flex flex-col justify-between items-center shadow-xl w-full max-w-[420px] px-6 py-8 sm:py-12 rounded-lg z-50 bg-white mx-auto max-h-[90vh] dark:bg-DarkblackText overflow-y-auto">
        <div className="flex flex-col items-center mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold">
            {mode === "login" ? "Witaj ponownie!" : "Zarejestruj się"}
          </h2>
          <p className="text-gray-500 dark:text-white/75 font-light mt-1 text-sm sm:text-base">
            {mode === "login"
              ? "Zaloguj się, aby kontynuować"
              : "Stwórz nowe konto"}
          </p>
        </div>

        <div className="w-full">
          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>

        <div className="text-sm mt-6 text-center">
          {mode === "login" ? (
            <>
              Nie masz konta?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-primaryBlue underline dark:text-primaryGreen"
              >
                Zarejestruj się
              </button>
            </>
          ) : (
            <>
              Masz już konto?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-primaryBlue dark:text-primaryGreen underline"
              >
                Zaloguj się
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
