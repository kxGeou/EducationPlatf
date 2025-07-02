import React from 'react'
import '../../styles/Interactive.css'
import Heading2 from '../typography/Heading2'
import SectionHeading from '../typography/SectionHeading'
import Description from '../typography/Description'

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
      <section className='bg-darkBlue text-white py-16 pb-12 w-full px-6 '>
        <SectionHeading textColor={"text-primaryGreen"}>Lorem, ipsum.</SectionHeading>
        <div className='mt-8 flex flex-col gap-4 md:w-full md:max-w-[400px]'>
          <Heading2 margin={"mb-2"} textColor={"text-white"}>Lorem ipsum dolor sit ipsum</Heading2>
          <Description textColor={"text-white"}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam cumque molestiae veritatis nisi facilis vitae corporis amet maxime, vel animi!</Description>
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