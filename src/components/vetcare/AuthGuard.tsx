'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const publicRoutes = ['/', '/login', '/cadastro', '/cadastro/cliente', '/cadastro/profissional', '/test-login'];
const authRoutes = ['/login', '/cadastro', '/cadastro/cliente', '/cadastro/profissional', '/cadastro/completar-perfil'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Não faça nada enquanto o estado de auth está carregando

    const isAuthRoute = authRoutes.includes(pathname);
    const isPublicRoute = publicRoutes.includes(pathname);

    // Se tem um usuário logado
    if (user) {
        const isProfileComplete = userProfile?.profileCompleted || false;
        
        // 1. Se o perfil não está completo, force o preenchimento
        if (!isProfileComplete && pathname !== '/cadastro/completar-perfil') {
            router.replace('/cadastro/completar-perfil');
            return;
        }

        // 2. Se o perfil está completo e ele está numa rota de autenticação, redirecione para o dashboard
        if (isProfileComplete && isAuthRoute) {
            const dashboard = userProfile?.role === 'professional' ? '/professional/dashboard' : '/portal/dashboard';
            router.replace(dashboard);
            return;
        }
    } else {
        // Se não tem usuário logado
        // 3. E ele tenta acessar uma rota protegida (que não é pública), mande para o login.
        if (!isPublicRoute && (pathname.startsWith('/portal') || pathname.startsWith('/professional'))) {
            router.replace('/login');
            return;
        }
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
