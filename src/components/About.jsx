import React from 'react'

function About() {
  return (
    <section className='w-full mt-26  px-6 py-8 flex flex-col md:flex-row md:justify-between md:mb-16'>
        <div className="lg:flex md:flex-col md:w-[400px]">
            <h2 className='text-blue-800 mb-4 lg:text-lg lg:font-semibold'>O nas</h2>
            <div className='flex flex-col gap-2'>
                <p className='font-semibold text-2xl text-blackText lg:text-4xl leading-8 lg:leading-11 lg:font-bold'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur eveniet harum</p>
                <span className='opacity-75 text-blackText lg:text-lg '>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore sit laudantium eligendi exercitationem, labore saepe.</span>
            </div>
        </div>
         <div className='w-full h-40 md:h-60 lg:h-70 md:w-[45%] rounded-lg bg-blackText text-white flex justify-center items-center mt-8'>Prototyp</div>
    </section>
  )
}

export default About