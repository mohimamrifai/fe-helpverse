import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/auth";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'eventOrganizer' | 'user')[];
  fallbackPath?: string;
}

export function AuthGuard({ 
  children, 
  allowedRoles = [], 
  fallbackPath = "/login" 
}: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      // Jika tidak terautentikasi, redirect ke halaman login
      if (!isAuthenticated) {
        navigate(fallbackPath, { 
          state: { from: window.location.pathname } 
        });
        return;
      }
      
      // Jika ada allowedRoles dan role user tidak termasuk dalam allowedRoles
      if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role as any)) {
        // Redirect ke homepage jika role tidak sesuai
        navigate("/", { 
          state: { 
            error: "Anda tidak memiliki akses ke halaman ini" 
          } 
        });
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, navigate, fallbackPath]);

  // Tampilkan loading atau konten jika sudah terautentikasi dan memiliki role yang sesuai
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Jika tidak terautentikasi atau role tidak sesuai, komponen akan redirect
  // Jadi kita hanya perlu menampilkan children jika sudah terautentikasi dan role sesuai
  if (isAuthenticated && (allowedRoles.length === 0 || (user?.role && allowedRoles.includes(user.role as any)))) {
    return <>{children}</>;
  }

  // Tampilkan loading saat proses redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
} 