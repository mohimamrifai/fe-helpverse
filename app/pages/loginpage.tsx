import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/auth";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login, refreshUserData, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Ambil data redirectTo dan paymentInfo dari location state
    const redirectTo = location.state?.redirectTo || "/";
    const paymentInfo = location.state?.paymentInfo || null;

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        rememberMe: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            console.log("Attempting login with:", formData.username);
            // API login menggunakan email, bukan username (sesuai dokumentasi)
            await login(formData.username, formData.password, formData.rememberMe);
            
            // Refresh user data untuk memastikan user data ter-load dengan benar
            console.log("Login successful, refreshing user data...");
            await refreshUserData();
            
            console.log("User data after refresh:", user);
            console.log("Navigating to:", redirectTo);
            
            // Jika ada payment info, kirim kembali ke payment page dengan payment info
            if (paymentInfo && redirectTo.includes('/payment')) {
                navigate(redirectTo, { 
                    replace: true,
                    state: paymentInfo
                });
            } else {
                navigate(redirectTo, { replace: true });
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err instanceof Error ? err.message : "Login failed. Please try again.");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <img src="/logo-blue.png" alt="HELPVerse Logo" className="mx-auto h-16 w-16" />
                    <h2 className="mt-6 text-3xl font-extrabold text-primary">Welcome to HELPVerse</h2>
                    <p className="mt-2 text-sm text-gray-600">Login to your account</p>
                    {paymentInfo && (
                        <p className="mt-2 text-sm font-medium text-orange-600">
                            Silakan login terlebih dahulu untuk melanjutkan pembayaran
                        </p>
                    )}
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Email atau Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Masukkan email atau username Anda"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Masukkan password Anda"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="rememberMe"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Ingat saya
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                                Lupa password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Masuk
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Belum punya akun?{" "}
                            <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                                Daftar
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
