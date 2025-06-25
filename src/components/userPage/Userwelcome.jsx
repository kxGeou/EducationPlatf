import React, { useEffect, useState } from 'react'
import supabase from '../../util/supabaseClient';
function Userwelcom() {
  const [userName, setUserName] = useState("user");
  const getUser = async () => {
    const {data,error} = await supabase.auth.getUser()
    if(error) {
      console.log("Error with fetching user", {error})
    } else {
      setUserName(data.user.user_metadata.full_name)
    }
  }
 
  useEffect(()=> {
    getUser()
  }, [])

  return (
    <div className='px-4 mb-12 mt-6'>
      <p className='text-2xl'>Cześć {userName} 👋</p>
      <span className='opacity-50'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius</span>
    </div>
  )
}

export default Userwelcom