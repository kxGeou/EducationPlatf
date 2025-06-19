import { Facebook, Instagram, Mail } from "lucide-react"

function Footer() {
    return (
        <footer className="w-full max-w-[1100px] grid grid-cols-3 py-6">
            <div>
                <h3 className=" text-lg">Kontakt</h3>


                <div className="flex flex-col mt-1">
                    <p className="opacity-50 cursor-pointer transiton-all hover:opacity-100">323 323 213</p>
                    <p className="opacity-50 cursor-pointer transiton-all hover:opacity-100">user@gmail.com</p>
                </div>
            </div>
            <div>
                <h3 className="text-lg">Social Media</h3>
                <div className="flex flex-col mt-1">
                    <p className="flex gap-2 items-center opacity-50 cursor-pointer transiton-all hover:opacity-100"><Instagram size={15}></Instagram>MaturaIT</p>
                    <p className="flex gap-2 items-center  opacity-50 cursor-pointer transiton-all hover:opacity-100"><Facebook size={15}></Facebook>MaturaIT</p>
                </div>
            </div>
            <div>
                <h3 className="text-lg">Dokumentacja</h3>

                <div className="flex flex-col mt-1">
                    <p className="opacity-50 cursor-pointer transiton-all hover:opacity-100">Regulamin</p>
                    <p className="opacity-50 cursor-pointer transiton-all hover:opacity-100">Cennik</p>
                    <p className="opacity-50 cursor-pointer transiton-all hover:opacity-100">Regulacje</p>
                    <p className="opacity-50 cursor-pointer transiton-all hover:opacity-100">Dokumenty</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer