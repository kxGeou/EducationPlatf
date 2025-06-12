import { Menu } from "lucide-react"
function Header() {
  return (
    <header className='flex justify-between w-full item-scenter py-6 px-4 z-10'>
        <div className='bg-white h-8 w-8'></div>
        <div className='bg-white/30 border border-white/20 flex justify-center items-center px-3 rounded-full transition-all hover:bg-white/40 cursor-pointer'><Menu className="text-white"></Menu></div>
    </header>
  )
}

export default Header