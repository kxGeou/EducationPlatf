import { ShieldXIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function WrongPage() {
    const navigate = useNavigate();
  return (
    <div className='w-full h-screen flex justify-center items-center'>
        <div className='flex items-center flex-col justify-center '>
            <ShieldXIcon size={36} className='mb-6 text-secondaryBlue'></ShieldXIcon>
            <h3 className='text-xl font-semibold text-darkBlue'>Nie możemy znaleść strony której szukasz</h3>
            <p className='text-lg mt-1 text-darkBlue/50'>Sprawdź czy wpisałeś poprawny adres strony</p>
            
            <button className='mt-8 w-[50%] rounded border border-secondaryBlue text-secondaryBlue cursor-pointer transition-all duration-300 hover:bg-secondaryBlue hover:text-white px-2 py-3' onClick={() => navigate("/")}>Wróć na stronę główną</button>
        </div>
    </div>
  )
}

export default WrongPage