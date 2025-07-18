import { ChevronRight } from 'lucide-react'
import React from 'react'

function HeroBlog() {
  return (
    <section className='w-full flex justify-between items-center mb-24 px-6'>
        <div>
          <div className='h-8 w-8 md:w-10 md:h-10 rounded-full bg-primaryGreen mb-6'></div>
          <div className='flex flex-col items-start text-5xl md:text-7xl'>
            <p className='text-blackText/75 font-thin'>Reach 245,00+</p>
            <p className='font-bold text-blackText'>monday.com</p>
            <p className='font-bold text-blackText'>customers</p>
          </div>
            <p className='w-full max-w-[500px] mt-6 text-blackText/75 leading-[26px] md:leading-[28px] md:text-lg'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum, ea in perferendis repellat molestiae obcaecati iure magni deleniti repellendus magnam?</p>
            <button className='flex items-center gap-1 text-white mt-6 md:text-lg cursor-pointer  rounded-[12px] px-4 py-[6px] bg-gradient-to-br from-secondaryGreen to-secondaryBlue'>Zobacz blogi <ChevronRight size={20}></ChevronRight></button>
        </div>
        <div className='md:flex hidden bg-blackText w-[40%] h-80  rounded-[12px] text-white items-center justify-center'>
          Prototyp
        </div>
    </section>
  )
}

export default HeroBlog