import React from 'react'
import Header from '../components/homepage/Header'
import Footer from '../components/homepage/Footer'
import Hero from '../components/resources/Hero'
import LessonBlock from '../components/resources/LessonBlock'
import Resources from "../resources.json";
import { Book } from 'lucide-react'
function TestResources() {
  return (
        <div className='flex flex-col bg-gradient-to-br to-50% from-secondaryBlue/50 to-gray-100'>
            <main className='min-h-screen flex flex-col max-w-[1100px] w-full mx-auto px-6'>
                <Header></Header>
                <Hero></Hero>
 
                <h2 className='flex items-center gap-2 mt-28 mb-6 text-lg md:text-xl text-darkBlue opacity-75'><Book size={20}></Book> Arkusze maturalne</h2>
                <div className='flex flex-col gap-18 mb-32'>
                {Resources.map((r, index) => (
                    <LessonBlock Resources={r} key={index}></LessonBlock>
                ))}
                </div>

            </main>
                <Footer></Footer>
    </div>
  )
}

export default TestResources