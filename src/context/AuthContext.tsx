
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isProfessional: boolean;
  signInWithGoogle: (role?: 'customer' | 'professional') => Promise<void>;
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

  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
      const provider = new GoogleAuthProvider();
      try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;

          // Verifica se o usuário já existe no Firestore
          const userDocRef = doc(db, "tutors", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
              // Se o usuário não existe, cria um novo documento
              await setDoc(userDocRef, {
                  name: user.displayName,
                  email: user.email,
                  phone: user.phoneNumber || '', // Google pode não fornecer telefone
                  role: role,
              });
          }
          // Se o usuário já existe, o login é concluído e o AuthContext
          // cuidará do redirecionamento com base na role existente.
          
      } catch (error) {
          console.error("Erro durante o signInWithGoogle:", error);
          // O erro será propagado para ser tratado na UI.
          throw error;
      }
  };


  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro');
    const isProfessionalRoute = pathname.startsWith('/professional');
    const isCustomerRoute = pathname.startsWith('/portal');

    if (!user && (isProfessionalRoute || isCustomerRoute)) {
      router.push('/login');
    }
    
    if (user) {
      if (isAuthPage) {
        // Se o usuário está logado e em uma página de autenticação, redirecione-o
        router.push(isProfessional ? '/professional/dashboard' : '/portal/dashboard');
      } else if (isProfessional && isCustomerRoute) {
        // Se é um profissional tentando acessar rota de cliente, redirecione
        router.push('/professional/dashboard');
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

  return <AuthContext.Provider value={{ user, loading, logout, isProfessional, signInWithGoogle }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
