import React from 'react'
import { useNavigate } from 'react-router-dom'
import Error from '../../assets/error.svg';
function WrongPage({isDark}) {
    const navigate = useNavigate();
  return (
    <div data-theme={isDark ? "dark" : "light"} className='w-full h-screen flex justify-center items-center dark:bg-blackText '>
        <div className='flex items-center flex-col justify-center '>
            <img src={Error} alt="error svg" />
            <h3 className='text-xl font-semibold text-darkBlue dark:text-white'>Nie możemy znaleść strony której szukasz</h3>
            <p className='text-lg  text-darkBlue/50 dark:text-white/50'>Sprawdź czy wpisałeś poprawny adres strony</p>
            
            <button className='mt-8 w-[50%] rounded border border-secondaryBlue dark:border-white text-secondaryBlue cursor-pointer transition-all duration-300 hover:bg-secondaryBlue dark:text-white  dark:border-0 dark:hover:bg-DarkblackBorder dark:bg-DarkblackText hover:text-white px-2 py-3' onClick={() => navigate("/")}>Wróć na stronę główną</button>
        </div>
    </div>
  )
}

export default WrongPage