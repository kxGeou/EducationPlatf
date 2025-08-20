import React from 'react';
import RobotBiurko from '../../assets/RobotBiurko.svg';
import Description from '../typography/Description';

function ContactHero() {
  return (
    <div className='mt-30 w-full flex flex-col md:flex-row justify-between items-center mb-32 gap-8'>
      
      <div className='w-full md:w-[50%] flex flex-col gap-4'>
        <h2 className='text-4xl md:text-6xl font-bold text-blackText dark:text-white'>
          Skontaktuj się z nami
        </h2>
        
        <Description textColor="text-blackText dark:text-white/75">
          Masz pytania dotyczące naszych kursów lub chcesz dowiedzieć się więcej o indywidualnych korepetycjach? 
          Napisz do nas, a nasz zespół odpowie Ci najszybciej jak to możliwe. 
        </Description>
      </div>

      <img src={RobotBiurko} className='w-[43%] hidden md:flex' alt="Robot siedzący" />
      
    </div>
  );
}

export default ContactHero;
