import { Facebook, Instagram, Mail } from "lucide-react";

function Footer({padding}) {
    return (
        <footer className={`w-full text-black py-10 ${padding}`}>
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                
                <div>
                    <h3 className="text-xl font-semibold mb-2">Kontakt</h3>
                    <address className="not-italic flex flex-col gap-1 text-sm">
                        <p className="opacity-50 cursor-pointer transition-all hover:opacity-100">323 323 213</p>
                        <p className="opacity-50 cursor-pointer transition-all hover:opacity-100">user@gmail.com</p>
                    </address>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2">Social Media</h3>
                    <div className="flex flex-col gap-1 text-sm">
                        <p className="flex gap-2 items-center opacity-50 cursor-pointer transition-all hover:opacity-100">
                            <Instagram size={15} /> MaturaIT
                        </p>
                        <p className="flex gap-2 items-center opacity-50 cursor-pointer transition-all hover:opacity-100">
                            <Facebook size={15} /> MaturaIT
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2">Dokumentacja</h3>
                    <div className="flex flex-col gap-1 text-sm">
                        <p className="opacity-50 cursor-pointer transition-all hover:opacity-100">Regulamin</p>
                        <p className="opacity-50 cursor-pointer transition-all hover:opacity-100">Cennik</p>
                        <p className="opacity-50 cursor-pointer transition-all hover:opacity-100">Regulacje</p>
                        <p className="opacity-50 cursor-pointer transition-all hover:opacity-100">Dokumenty</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
