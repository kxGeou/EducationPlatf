import { Menu, User } from 'lucide-react'
import React from 'react'
import useWindowWidth from '../../hooks/useWindowWidth'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LandingHeader() {
    const width = useWindowWidth();
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
    <div className='w-full shadow-lg px-2 py-3 flex justify-center'>
        <header className='flex justify-between items-center w-full max-w-[1100px]'>
            <div className='bg-primaryBlue w-6 h-6'></div>
            
            {width > 800 ?
            <ul className='flex items-center gap-4'>
                <li>qwe</li>
                <User size={20} onClick={() => UserNavigateHandle()}></User>
            </ul>
            :
            <Menu size={32}></Menu>
            }
        </header>
    </div>
  )
}

export default LandingHeader