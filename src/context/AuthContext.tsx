
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            console.log("[AUTH LISTENER] Usuário detectado:", currentUser.uid);
            
            const userDocRef = doc(db, 'tutors', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("[FIRESTORE] Documento do usuário já existe.");
                const professionalStatus = userData.role === 'professional';
                setIsProfessional(professionalStatus);
                const isProfileComplete = userData.phone && userData.phone.trim() !== '';
                const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro');
                
                if (!isProfileComplete && !pathname.endsWith('/completar-perfil')) {
                  router.push('/cadastro/completar-perfil');
                } else if (isProfileComplete && (isAuthPage || pathname === '/')) {
                  router.push(professionalStatus ? '/professional/dashboard' : '/portal/dashboard');
                }
            }
            setUser(currentUser);
        } else {
            console.log("[AUTH LISTENER] Nenhum usuário detectado.");
            setUser(null);
            setIsProfessional(false);
        }
        setLoading(false);
    });

    // Limpeza do listener quando o componente for desmontado
    return () => unsubscribe();
  }, [pathname, router]); // Adicionado pathname e router para estabilidade


  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
    const provider = new GoogleAuthProvider();
    try {
        console.log("[AUTH] Iniciando signInWithPopup...");
        const result = await signInWithPopup(auth, provider);
        console.log("[AUTH] signInWithPopup concluído com SUCESSO. Resultado:", result);

        const user = result.user;
        console.log("[AUTH] Objeto de usuário do Firebase:", user);
        
        const userDocRef = doc(db, 'tutors', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName,
                email: user.email,
                phone: user.phoneNumber || '',
                role: role,
            });
             console.log("[FIRESTORE] Novo documento de usuário criado com a role:", role);
        } else {
            console.log("[FIRESTORE] Documento do usuário já existente, login normal.");
        }
        
        toast({ title: "Login realizado com sucesso!" });

    } catch (error) {
        console.error("!!!!!!!!!! [AUTH] ERRO CRÍTICO NO FLUXO DE LOGIN !!!!!!!!!!", error);
        toast({ variant: "destructive", title: "Erro ao fazer login.", description: "Por favor, tente novamente." });
    }
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

