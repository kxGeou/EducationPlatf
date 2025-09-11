import React from 'react'
function Loading({isDark}) {
  return (
    <div data-theme={isDark ? "dark" : "light"} className='w-full h-screen flex items-center justify-center bg-blackText'>
        <img src="../loader.gif" alt="loading" className='w-20'/>
    </div>
  )
}

export default Loading