import { useState } from 'react'
import MiniComp from '../components/MiniComp'
import Courses from '../components/Courses'
import { Link } from 'react-router-dom'
function App() {

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-slate-800'>
      <MiniComp></MiniComp>
      <Courses></Courses>
    </div>
  )
}

export default App
