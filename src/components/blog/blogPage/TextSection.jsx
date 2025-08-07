import React from 'react'

function TextSection({third_header, third_description}) {
  return (
    <div className='px-4 mt-32 flex flex-col gap-2'>
        <h3 className='text-4xl font-semibold max-w-[600px]'>{third_header}</h3>
        <p className='max-w-[800px] opacity-75'>{third_description}</p>
    </div>
  )
}

export default TextSection