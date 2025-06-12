import { useState } from 'react'
import Header from '../components/Header'
import './AuthPage.css';
import Hero from '../components/Hero';
import CourseListHero from '../components/CourseListHero';
import { BookMarked } from 'lucide-react';
function App() {

  return (
    <main className='relative flex flex-col items-center justify-start min-h-screen bg-white'>
      <div className="gradient-background absolute top-0 left-0 w-full h-[45%]"></div>
      <Header></Header>
      <Hero></Hero>
      <p className='flex gap-2 items-center w-full px-4 mt-14 mb-5 opacity-50'><BookMarked size={18}></BookMarked>Dostępne kursy</p>
      <CourseListHero></CourseListHero>
    </main>
  )
}

export default App
