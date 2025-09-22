
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isProfessional: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfessional, setIsProfessional] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Se houver um usuário, verifique sua role no Firestore
        const userDocRef = doc(db, 'tutors', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'professional') {
          setIsProfessional(true);
        } else {
          setIsProfessional(false);
        }
      } else {
        setIsProfessional(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/cadastro';
    const isProfessionalRoute = pathname.startsWith('/professional');
    const isCustomerRoute = pathname.startsWith('/portal');

    if (!user && (isProfessionalRoute || isCustomerRoute)) {
      router.push('/login');
    }
    
    if (user) {
      if (isAuthPage) {
        // Se o usuário está logado e em uma página de autenticação, redirecione-o
        router.push(isProfessional ? '/professional/dashboard' : '/portal/dashboard');
      } else if (isProfessional && !isProfessionalRoute) {
        // Se é um profissional fora da rota de profissional, redirecione-o
        if (!isCustomerRoute) router.push('/professional/dashboard'); // Evita loop em páginas públicas
      } else if (!isProfessional && isProfessionalRoute) {
        // Se não é um profissional tentando acessar a rota de profissional, bloqueie
        router.push('/portal/dashboard');
      }
    }

  }, [user, isProfessional, loading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
    setIsProfessional(false);
    router.push('/login'); // Redireciona explicitamente para garantir
  };


  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando sistema...</p>
            </div>
        </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading, logout, isProfessional }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
