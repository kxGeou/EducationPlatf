import React from 'react'
import Turek from '../../assets/RobotSiedzącyTur.svg';
function ContactHero() {
  return (
    <div className='mt-36  w-full flex justify-between items-start mb-32'>
        <div className='w-full md:w-[50%] flex flex-col gap-2'>
            <h2 className='text-4xl md:text-6xl font-bold text-blackText'>Skontaktuj się z nami</h2>
            <p className='opacity-75'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam delectus, fuga totam laborum libero saepe praesentium fugit aspernatur, porro aliquam tempora tenetur accusamus voluptatibus voluptas.</p>
        </div>

        <img src={Turek} className='w-[15%] hidden md:flex'/>
    </div>
  )
}

export default ContactHero