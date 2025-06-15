import React from 'react'

function About() {
  return (
    <section className='w-full mt-16 bg-blue-100/30 px-6 py-8 flex flex-col'>
        <h2 className='text-blue-800 mb-4'>O nas</h2>
       
        <div className='flex flex-col gap-2'>
            <p className='font-semibold text-2xl leading-8'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur eveniet harum</p>
            <span className='opacity-50 text'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore sit laudantium eligendi exercitationem, labore saepe.</span>
        </div>
         <div className='w-full h-40 rounded-lg bg-gray-900 text-white flex justify-center items-center mt-8'>Prototyp</div>
    </section>
  )
}

export default About