
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
    // Esta função lida com a criação/verificação de documentos e o redirecionamento pós-login.
    const handleUserSession = async (user: User) => {
      setLoading(true);
      console.log("[HANDLE SESSION] Verificando documento para o usuário:", user.uid);
      
      const userDocRef = doc(db, 'tutors', user.uid);
      const userDoc = await getDoc(userDocRef);
  
      let userData;
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro') || pathname === '/test-login';
  
      if (!userDoc.exists()) {
        console.log("[FIRESTORE] Documento não existe. Criando novo documento...");
        // Recupera o papel da sessão se ele foi salvo antes do redirecionamento
        const role = sessionStorage.getItem('googleAuthRole') || 'customer';
        sessionStorage.removeItem('googleAuthRole'); // Limpa o item da sessão
  
        userData = {
          name: user.displayName,
          email: user.email,
          phone: user.phoneNumber || '',
          role: role,
        };
        await setDoc(userDocRef, userData);
        console.log("[FIRESTORE] Documento do usuário criado com sucesso.");
      } else {
        userData = userDoc.data();
        console.log("[FIRESTORE] Documento do usuário já existe:", userData);
      }
      
      setIsProfessional(userData.role === 'professional');
      
      const isProfileComplete = userData.phone && userData.phone.trim() !== '';
  
      console.log(`[HANDLE SESSION] Redirecionando... isProfileComplete: ${isProfileComplete}, isAuthPage: ${isAuthPage}, role: ${userData.role}, pathname: ${pathname}`);
  
      if (!isProfileComplete && pathname !== '/cadastro/completar-perfil') {
          router.push('/cadastro/completar-perfil');
      } else if (isProfileComplete && (isAuthPage || pathname === '/')) {
          router.push(userData.role === 'professional' ? '/professional/dashboard' : '/portal/dashboard');
      }
      
      setLoading(false);
    };

    console.log("[AUTH LISTENER] Configurando o onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        console.log("[AUTH LISTENER] Usuário detectado:", currentUser.uid);
        await handleUserSession(currentUser);
      } else {
        console.log("[AUTH LISTENER] Nenhum usuário detectado.");
        setIsProfessional(false);
        setLoading(false);
        if (pathname.startsWith('/portal') || pathname.startsWith('/professional')) {
            router.push('/login');
        }
      }
    });
    
    // Processa o resultado do redirecionamento do Google
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          console.log("[REDIRECT] Resultado obtido com SUCESSO! Usuário:", result.user.uid);
          // O onAuthStateChanged já vai ser chamado e vai rodar o handleUserSession.
          // Não precisamos fazer nada duplicado aqui, apenas aguardar.
        } else {
            console.log("[REDIRECT] Nenhum resultado de redirecionamento encontrado. Carregamento normal.");
        }
      })
      .catch((error) => {
        console.error("!!!!!!!!!! [REDIRECT] ERRO CRÍTICO AO PROCESSAR RESULTADO !!!!!!!!!!", error);
        toast({
          variant: "destructive",
          title: "Erro de Autenticação",
          description: `Não foi possível completar o login. (${error.code || error.message})`
        });
      });

    return () => {
      console.log("[AUTH LISTENER] Limpando o onAuthStateChanged.");
      unsubscribe();
    };
  }, []);


  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
      const provider = new GoogleAuthProvider();
      console.log("[AUTH] Iniciando signInWithRedirect...");
      // Salva o 'role' na sessão para recuperá-lo após o redirecionamento
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
