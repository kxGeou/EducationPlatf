import React from 'react';
import RobotBiurko from '../../../assets/RobotBiurko.svg';
import Description from '../../../components/typography/Description';

function ContactHero() {
  return (
    <div className='w-full flex flex-col md:flex-row justify-between items-center mb-24 gap-8 '>
      
      <div className='w-full md:w-[50%] flex flex-col gap-4 z-20'>
        <h2 className='text-5xl md:text-7xl font-bold text-blackText dark:text-white'>
          Skontaktuj się z nami
        </h2>
        
        <Description textColor="text-blackText dark:text-white/70 z-20">
          Masz pytania dotyczące naszych kursów lub chcesz dowiedzieć się więcej o indywidualnych korepetycjach? 
          Napisz do nas, a nasz zespół odpowie Ci najszybciej jak to możliwe. 
        </Description>
      </div>

      <img src={RobotBiurko} className='w-[43%] hidden md:flex z-20' alt="Robot siedzący" />
      
    </div>
  );
}

export default ContactHero;
