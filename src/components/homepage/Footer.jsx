import { Facebook, Instagram, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Footer({ padding = "" }) {
    const navigate = useNavigate();
    return (
        <footer className={`w-full bg-white dark:bg-DarkblackText text-black dark:text-white mt-20 pt-12 pb-8 ${padding}`}>
            <div className="max-w-[1100px] mx-auto md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                
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

            <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-xs opacity-60">
                © {new Date().getFullYear()} TwojaFirma. Wszelkie prawa zastrzeżone.
            </div>
        </footer>
    );
}

export default Footer;
