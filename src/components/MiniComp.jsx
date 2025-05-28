import React from 'react'
import { useAuth } from '../context/AuthContext'

function MiniComp() {

    const {user, loading, logout} = useAuth()

  if (loading) return <p>Ładowanie sesji...</p>
  
  return user ? (
    <>
        <p>Zalogowany jako: {user.email}</p>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Wyloguj się</button>

    </>
  ) : (
    <p>Nie jesteś zalogowany</p>
  )
}

export default MiniComp
