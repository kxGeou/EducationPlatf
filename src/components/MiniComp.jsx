import { useAuth } from "../context/AuthContext";
import React from "react";
import { Link } from "react-router-dom";

function MiniComp() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Ładowanie sesji...</p>;

  return user ? (
    <div className="flex flex-col text-white gap-4">
      <p>Zalogowany jako: {user.email}</p>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Wyloguj się
      </button>
      <Link
        to="/myCourses"
        className="bg-indigo-600 text-white text-center px-4 py-2 rounded"
      >
        Przeglądaj kursy
      </Link>
    </div>
  ) : (
    <div className="flex justify-center items-center gap-4 text-white">
      <p>Nie jesteś zalogowany</p>
      <Link
        to="/login-register"
        className="p-2 bg-indigo-600 text-white rounded"
      >
        Zaloguj się
      </Link>
    </div>
  );
}

export default MiniComp;
