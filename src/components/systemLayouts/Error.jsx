import { RefreshCw } from 'lucide-react'

function Error() {

    function handleReturn() {
        window.location.reload();
    }

  return (
    <div className='w-full h-screen flex flex-col relative items-center justify-center'>
        <div className='flex flex-col justify-center items-center gap-2 text-red-600 cursor-pointer' onClick={()=> handleReturn()}>
            <RefreshCw size={28} className='animate-spin'></RefreshCw>
            <span>Coś poszło nie tak...</span>
        </div>
    </div>
  )
}

export default Error