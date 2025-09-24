
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, getRedirectResult } from 'firebase/auth';
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
    console.log("[AUTH LISTENER] Configurando o onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        console.log("[AUTH LISTENER] Usuário detectado:", user.uid);
        setUser(user);
        await handleUserSession(user);
      } else {
        console.log("[AUTH LISTENER] Nenhum usuário detectado.");
        setUser(null);
        setIsProfessional(false);
        setLoading(false);
      }
    });
    return () => {
        console.log("[AUTH LISTENER] Limpando o onAuthStateChanged.");
        unsubscribe();
    };
  }, []);

  const handleUserSession = async (user: User) => {
    console.log("[HANDLE SESSION] Verificando documento para o usuário:", user.uid);
    const userDocRef = doc(db, 'tutors', user.uid);
    const userDoc = await getDoc(userDocRef);

    let userData;
    if (userDoc.exists()) {
        console.log("[HANDLE SESSION] Documento do usuário encontrado:", userDoc.data());
        userData = userDoc.data();
        if (userData.role === 'professional') {
            setIsProfessional(true);
        } else {
            setIsProfessional(false);
        }
    } else {
        console.warn("[HANDLE SESSION] Documento do usuário NÃO encontrado. Isso não deveria acontecer após o login com Google.");
        // Fallback for safety, should not be hit with the new logic
        const role = 'customer'; // Default to customer for safety
        userData = { name: user.displayName, email: user.email, phone: user.phoneNumber || '', role };
        await setDoc(userDocRef, userData);
        setIsProfessional(role === 'professional');
    }

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro');
    const isProfileComplete = userData.phone && userData.phone.trim() !== '';

    console.log(`[HANDLE SESSION] Redirecionando... isProfileComplete: ${isProfileComplete}, isAuthPage: ${isAuthPage}, role: ${userData.role}`);
    if (!isProfileComplete && pathname !== '/cadastro/completar-perfil') {
        router.push('/cadastro/completar-perfil');
    } else if (isProfileComplete && (isAuthPage || pathname === '/cadastro/completar-perfil' || pathname === '/')) {
        router.push(userData.role === 'professional' ? '/professional/dashboard' : '/portal/dashboard');
    }

    setLoading(false);
  };
  
  useEffect(() => {
    // This effect handles redirection for unauthenticated users trying to access protected routes.
    if (!loading && !user) {
        const isProtectedRoute = pathname.startsWith('/portal') || pathname.startsWith('/professional');
        if (isProtectedRoute) {
            console.log("[AUTH GUARD] Usuário não autenticado tentando acessar rota protegida. Redirecionando para /login.");
            router.push('/login');
        }
    }
  }, [user, loading, pathname, router]);


  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
      const provider = new GoogleAuthProvider();
      
      sessionStorage.setItem('google_signup_role', role);

      try {
        console.log("[AUTH] Iniciando signInWithPopup...");
        const result = await signInWithPopup(auth, provider);
        console.log("[AUTH] signInWithPopup concluído com SUCESSO. Resultado:", result);

        const user = result.user;
        console.log("[AUTH] Objeto de usuário do Firebase:", user);
        console.log("[AUTH] UID do usuário:", user.uid);

        console.log("[FIRESTORE] Verificando/criando documento para o usuário...");
        const userDocRef = doc(db, "tutors", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            console.log("[FIRESTORE] Documento não existe. Criando novo documento...");
            const roleFromSession = sessionStorage.getItem('google_signup_role') || 'customer';
            await setDoc(userDocRef, {
                name: user.displayName,
                email: user.email,
                phone: user.phoneNumber || '',
                role: roleFromSession,
            });
            console.log("[FIRESTORE] Documento do usuário criado com sucesso.");
        } else {
             console.log("[FIRESTORE] Documento do usuário já existe.");
        }
        
        sessionStorage.removeItem('google_signup_role');
        toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
        // The onAuthStateChanged listener will now handle the redirection logic.

      } catch (error: any) {
          console.error("!!!!!!!!!! [AUTH] ERRO CRÍTICO NO FLUXO DE LOGIN !!!!!!!!!!", error);
          sessionStorage.removeItem('google_signup_role');

          toast({
            variant: "destructive",
            title: "Ocorreu um erro inesperado.",
            description: `Não foi possível completar seu login. (${error.code || error.message})`
          });
      }
  };

  const logout = async () => {
    await signOut(auth);
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
