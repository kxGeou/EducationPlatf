import React from 'react'
import RedHeader from '../../ui/Header';

function Regulations({isDark, setIsDark}) {
  return (
    <div data-theme={isDark ? "dark" : "light"}>
      <RedHeader isDark={isDark} setIsDark={setIsDark}/>
        
        Regulations
        </div>
  )
}

export default Regulations