import React from 'react'
import '../styles/Interactive.css'

function Stats({Title, Description}) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <span className='w-[2px] bg-blue-300'></span>
        <p className='text-m md:text-lg md:font-semibold'>{Title}</p>
      </div>
      <p className='opacity-75 text-sm ml-3 md:max-w-[200px] md:w-full'>{Description}</p>
    </div>
  )
}

function Interactive() {

  const stats = [
    {title : "10 tysięcy +", description : "Uczniow na platformie"},
    {title : "100%", description : "Bezpieczeństwa dla danych osobowych"},
    {title : "50", description : "Nauczycieli na platformie do pomocy kazdemu uzytkownikowi"},
  ]

  return (
      <section className='bg-darkBlue text-white py-4 pb-12 w-full px-6 '>
        <h2 className='mt-16 text-blue-400'>Lorem, ipsum.</h2>
        <div className='mt-8 flex flex-col gap-4 md:w-full md:max-w-[400px]'>
          <h3 className='text-2xl font-semibold w-full md:text-4xl'>Lorem ipsum dolor sit ipsum</h3>
          <p className='opacity-75'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam cumque molestiae veritatis nisi facilis vitae corporis amet maxime, vel animi!</p>
        </div>

          <ul className='flex flex-col gap-6 mt-12 md:flex-row '>
          {stats.map((s, index) => (
            <Stats Title={s.title} Description={s.description} key={index}></Stats>
          ))}
          </ul>

      </section> 
  )
}

export default Interactive