import React from 'react'
import Heading2 from '../typography/Heading2'
import SectionHeading from '../typography/SectionHeading'
import Description from '../typography/Description'
function About() {
  return (
    <section className='w-full mt-26  px-6 py-8 flex flex-col md:flex-row md:justify-between md:mb-16 items-center'>
        <div className="lg:flex md:flex-col md:w-[400px]">
            <SectionHeading textColor={"text-primaryBlue"}>O nas</SectionHeading>
            <div className='flex flex-col gap-2'>
                <Heading2 margin={"mb-2"} textColor={"text-blackText"}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur eveniet harum</Heading2>
                <Description textColor={"text-blackText"}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore sit laudantium eligendi exercitationem, labore saepe.</Description>
            </div>
        </div>
         <div className='w-full h-40 md:h-60 lg:h-70 md:w-[45%] rounded-[12px] bg-blackText text-white flex justify-center items-center mt-8'>Prototyp</div>
    </section>
  )
}

export default About