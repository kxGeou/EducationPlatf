import { Facebook, Instagram, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from '../assets/logo_biale.svg';
import LogoDark from '../assets/logoDesk.png'
function Footer({isDark}) {
    const navigate = useNavigate();
    return (
        <footer className={`w-full bg-gray-100 dark:bg-blackText text-black dark:text-white mt-20 pt-12 pb-8 max-w-[1200px] px-4`}>
            <div className="max-w-[1200px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <div>
                    <p>Lorem</p>
                    
                </div>
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold tracking-tight">Kontakt</h3>
                    <address className="not-italic text-sm space-y-1">
                        <p className="opacity-60 hover:opacity-100 transition cursor-pointer" onClick={() => navigate("/contact")}>Napisz do nas</p>
                        <p className="opacity-60 hover:opacity-100 transition cursor-pointer">323 323 213</p>
                        <p className="opacity-60 hover:opacity-100 transition cursor-pointer">user@gmail.com</p>
                    </address>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold tracking-tight">Social Media</h3>
                    <div className="flex flex-col text-sm gap-2">
                        <a
                            href="#"
                            aria-label="Instagram"
                            className="flex items-center gap-2 opacity-60 hover:opacity-100 transition"
                        >
                            <Instagram size={16} /> Instagram
                        </a>
                        <a
                            href="#"
                            aria-label="Facebook"
                            className="flex items-center gap-2 opacity-60 hover:opacity-100 transition"
                        >
                            <Facebook size={16} /> Facebook
                        </a>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold tracking-tight">Dokumentacja</h3>
                    <ul className="text-sm space-y-1">
                        <li className="opacity-60 hover:opacity-100 transition cursor-pointer" onClick={() => navigate("/regulations")}>Regulamin</li>
                        <li className="opacity-60 hover:opacity-100 transition cursor-pointer">Cennik</li>
                        <li className="opacity-60 hover:opacity-100 transition cursor-pointer">Dokumenty</li>
                    </ul>
                </div>
            </div>

            <div className="mt-18 mb-4 text-center text-xs opacity-60">
                © {new Date().getFullYear()} TwojaFirma. Wszelkie prawa zastrzeżone.
            </div>
        </footer>
    );
}

export default Footer;
