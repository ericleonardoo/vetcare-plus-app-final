
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


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
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
        try {
            console.log("[REDIRECT] Verificando resultado do redirecionamento...");
            const result = await getRedirectResult(auth);
            if (result) {
                console.log("[REDIRECT] Resultado obtido com SUCESSO!", result.user.uid);
                const userDocRef = doc(db, 'tutors', result.user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    const role = sessionStorage.getItem('googleAuthRole') || 'customer';
                    sessionStorage.removeItem('googleAuthRole');
                    await setDoc(userDocRef, {
                        name: result.user.displayName,
                        email: result.user.email,
                        phone: result.user.phoneNumber || '',
                        role: role,
                    });
                }
            }
        } catch (error) {
            console.error("[REDIRECT] Erro ao processar redirect:", error);
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
           console.log("[AUTH LISTENER] Listener disparado.");
          if (currentUser) {
            console.log("[AUTH LISTENER] Usuário detectado:", currentUser.uid);
            setUser(currentUser);
            
            const userDocRef = doc(db, 'tutors', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            let userData;
            
            if (userDoc.exists()) {
                userData = userDoc.data();
                console.log("[FIRESTORE] Documento do usuário já existe.");
                 setIsProfessional(userData.role === 'professional');
                const isProfileComplete = userData.phone && userData.phone.trim() !== '';
                const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro') || pathname === '/test-login';
                
                if (!isProfileComplete && !pathname.endsWith('/completar-perfil')) {
                  router.push('/cadastro/completar-perfil');
                } else if (isProfileComplete && (isAuthPage || pathname === '/')) {
                  router.push(userData.role === 'professional' ? '/professional/dashboard' : '/portal/dashboard');
                }
            }
          } else {
            console.log("[AUTH LISTENER] Nenhum usuário detectado.");
            setUser(null);
            setIsProfessional(false);
          }
          setLoading(false);
        });

        return () => {
            console.log("[AUTH CONTEXT] Limpando listener.");
            unsubscribe();
        };
    };

    checkAuth();
  }, [pathname, router]); 


  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
      const provider = new GoogleAuthProvider();
      console.log("[AUTH] Iniciando signInWithRedirect...");
      sessionStorage.setItem('googleAuthRole', role);
      await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/');
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
