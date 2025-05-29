import { useState } from 'react'
import MiniComp from '../components/MiniComp'
import Courses from '../components/Courses'
import { Link } from 'react-router-dom'

function App() {

  return (
    <div className='w-screen'>
      <Link to="/login-register" className="p-2 bg-indigo-600 text-white rounded">Zaloguj się</Link>
      <MiniComp></MiniComp>
      <Courses></Courses>
    </div>
  )
}

export default App
