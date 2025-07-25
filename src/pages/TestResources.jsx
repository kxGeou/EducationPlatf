import React from 'react'
import Header from '../components/homepage/Header'
import Footer from '../components/homepage/Footer'
import Hero from '../components/resources/Hero'

function TestResources() {
  return (
        <div className='flex flex-col items-center min-h-screen bg-gradient-to-br to-50% from-secondaryBlue/50 to-gray-100'>
            <main className='min-h-screen max-w-[1100px] w-full mx-auto'>
                <Header></Header>
                <Hero></Hero>
                
            </main>
                <Footer></Footer>
    </div>
  )
}

export default TestResources