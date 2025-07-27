import { Menu, User } from 'lucide-react'
import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LandingHeader() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    function UserNavigateHandle(){
        if(user){
            navigate("/user_page")
        } else {
            navigate("authentication")
        }
    }

  return (
    <div className='w-full px-4 py-3 flex justify-center md:py-4'>
        <header className='flex justify-between items-center w-full max-w-[1100px]'>
            <div className='bg-primaryBlue w-6 h-6'></div>
                <User size={22} className='transiton-all duration-300 cursor-pointer hover:text-primaryBlue' onClick={() => UserNavigateHandle()}></User>
        </header>
    </div>
  )
}

export default LandingHeader