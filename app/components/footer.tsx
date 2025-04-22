import { Link } from "react-router";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export function Footer() {
    return (
        <footer className="bg-white shadow-md py-8 px-4 md:px-10">
            <div className="container mx-auto">
                <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo-blue.png" alt="logo" className="w-12 h-12" />
                        <h1 className="text-2xl font-bold text-primary">HELPVerse</h1>
                    </Link>

                    <div className="flex flex-col gap-3 md:flex-row md:gap-8">
                        <Link to="/about" className="text-primary hover:text-primary/80 font-medium transition-colors">About us</Link>
                        <Link to="/faq" className="text-primary hover:text-primary/80 font-medium transition-colors">FAQ</Link>
                        <Link to="/contact" className="text-primary hover:text-primary/80 font-medium transition-colors">Contact us</Link>
                    </div>

                    <div className="flex gap-4 items-center">
                        <Link to="#" className="bg-primary text-secondary p-2 rounded-full hover:bg-primary/90 transition-colors">
                            <FaFacebookF className="text-lg" />
                        </Link>
                        <Link to="#" className="bg-primary text-secondary p-2 rounded-full hover:bg-primary/90 transition-colors">
                            <FaInstagram className="text-lg" />
                        </Link>
                        <Link to="#" className="bg-primary text-secondary p-2 rounded-full hover:bg-primary/90 transition-colors">
                            <FaTwitter className="text-lg" />
                        </Link>
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} HELPVerse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
