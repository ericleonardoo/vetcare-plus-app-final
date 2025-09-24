'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const publicRoutes = ['/', '/login', '/cadastro', '/cadastro/cliente', '/cadastro/profissional'];
const authRoutes = ['/login', '/cadastro', '/cadastro/cliente', '/cadastro/profissional', '/cadastro/completar-perfil'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Não faça nada enquanto o estado de auth está carregando

    const isProfileComplete = userProfile?.profileCompleted || false;

    if (user && !isProfileComplete && pathname !== '/cadastro/completar-perfil') {
      // Se está logado, mas perfil incompleto E não está na página de completar perfil, force-o para lá.
      router.replace('/cadastro/completar-perfil');

    } else if (user && isProfileComplete && authRoutes.includes(pathname)) {
      // Se está logado, perfil completo E está em uma página de auth, mande para o dashboard.
      const dashboard = userProfile?.role === 'professional' ? '/professional/dashboard' : '/portal/dashboard';
      router.replace(dashboard);

    } else if (!user && !publicRoutes.includes(pathname) && (pathname.startsWith('/professional') || pathname.startsWith('/portal'))) {
        // Se não está logado e tenta acessar uma rota protegida
        router.replace('/login');
    }

  }, [user, userProfile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
