
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
      setLoading(true); // Sempre começa como loading ao detectar mudança
      if (user) {
        console.log("[AUTH LISTENER] Usuário detectado:", user.uid);
        setUser(user); // Define o usuário primeiro
        await handleUserSession(user); // Processa e redireciona DEPOIS
      } else {
        console.log("[AUTH LISTENER] Nenhum usuário detectado.");
        setUser(null);
        setIsProfessional(false);
        
        // Se não houver usuário, verifica se a rota é protegida
        const isProtectedRoute = pathname.startsWith('/portal') || pathname.startsWith('/professional');
        if (isProtectedRoute) {
            console.log("[AUTH GUARD] Usuário deslogado em rota protegida. Redirecionando para /login.");
            router.push('/login');
        }
        setLoading(false);
      }
    });
    return () => {
        console.log("[AUTH LISTENER] Limpando o onAuthStateChanged.");
        unsubscribe();
    };
  }, [pathname, router]); // Adicionado pathname e router para reavaliar a guarda de rota se necessário

  const handleUserSession = async (user: User) => {
    console.log("[HANDLE SESSION] Verificando documento para o usuário:", user.uid);
    const userDocRef = doc(db, 'tutors', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("[HANDLE SESSION] Documento do usuário encontrado:", userData);
        setIsProfessional(userData.role === 'professional');

        const isProfileComplete = userData.phone && userData.phone.trim() !== '';
        const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro') || pathname === '/test-login';
        
        console.log(`[HANDLE SESSION] Redirecionando... isProfileComplete: ${isProfileComplete}, isAuthPage: ${isAuthPage}, role: ${userData.role}`);
        
        if (!isProfileComplete && pathname !== '/cadastro/completar-perfil') {
            router.push('/cadastro/completar-perfil');
        } else if (isProfileComplete && (isAuthPage || pathname === '/')) {
             router.push(userData.role === 'professional' ? '/professional/dashboard' : '/portal/dashboard');
        }
    } else {
      console.warn("[HANDLE SESSION] Documento do usuário NÃO encontrado. Isso pode acontecer durante o primeiro login.");
      // Se o documento não existe, a função `signInWithGoogle` cuidará da criação.
      // O `onAuthStateChanged` será acionado novamente após a criação, se necessário.
    }
    setLoading(false); // Finaliza o loading após o processamento
  };


  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
      const provider = new GoogleAuthProvider();
      
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
            await setDoc(userDocRef, {
                name: user.displayName,
                email: user.email,
                phone: user.phoneNumber || '',
                role: role,
            });
            console.log("[FIRESTORE] Documento do usuário criado com sucesso.");
        } else {
             console.log("[FIRESTORE] Documento do usuário já existe.");
        }
        
        toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
        // Agora, o onAuthStateChanged que já está escutando vai pegar esse novo usuário
        // e chamar handleUserSession para fazer o redirecionamento correto.
        // Não precisamos de um `router.push` aqui.

      } catch (error: any) {
          console.error("!!!!!!!!!! [AUTH] ERRO CRÍTICO NO FLUXO DE LOGIN !!!!!!!!!!", error);
          toast({
            variant: "destructive",
            title: "Ocorreu um erro inesperado.",
            description: `Não foi possível completar seu login. (${error.code || error.message})`
          });
          throw error; // Lança o erro para a página que chamou poder tratar
      }
  };

  const logout = async () => {
    await signOut(auth);
    // Limpeza de estado local
    setUser(null);
    setIsProfessional(false);
    // O onAuthStateChanged vai detectar a ausência de usuário e redirecionar se necessário.
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
