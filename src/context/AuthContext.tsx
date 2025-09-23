
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
          const userDocRef = doc(db, "tutors", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
              // Se o usuário não existe, cria um novo documento
              await setDoc(userDocRef, {
                  name: user.displayName,
                  email: user.email,
                  phone: user.phoneNumber || '',
                  role: role,
              });
          }
      } catch (error) {
          console.error("Erro durante o signInWithGoogle:", error);
          throw error;
      }
  };

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro');
    const isPublicPage = !pathname.startsWith('/portal') && !pathname.startsWith('/professional');

    if (user) {
        const userDocRef = doc(db, 'tutors', user.uid);
        getDoc(userDocRef).then(userDoc => {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const isProfileComplete = userData.phone && userData.phone.trim() !== '';

                if (!isProfileComplete && pathname !== '/cadastro/completar-perfil') {
                    // Se o perfil está incompleto, redireciona para completar
                    router.push('/cadastro/completar-perfil');
                } else if (isProfileComplete && (isAuthPage || pathname === '/cadastro/completar-perfil')) {
                    // Se o perfil está completo e está numa página de auth, redireciona para o dashboard
                    router.push(userData.role === 'professional' ? '/professional/dashboard' : '/portal/dashboard');
                }
            }
        });
    } else {
        // Se não há usuário e a rota não é pública, redireciona para o login
        if (!isPublicPage) {
            router.push('/login');
        }
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
    setIsProfessional(false);
    router.push('/login');
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
