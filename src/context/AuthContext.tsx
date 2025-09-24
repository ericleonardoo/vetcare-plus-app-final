
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser); // Define o usuário imediatamente

        if (currentUser) {
            const userDocRef = doc(db, 'tutors', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
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
            // Se o doc não existe, o fluxo de `signInWithGoogle` criará e o listener será reativado.
        } else {
            setIsProfessional(false);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);


  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const userDocRef = doc(db, 'tutors', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName,
                email: user.email,
                phone: user.phoneNumber || '',
                role: role,
            });
        }
        
        // A lógica de redirecionamento já é tratada pelo useEffect listener.
        toast({ title: "Login realizado com sucesso!" });

    } catch (error) {
        console.error("Erro no fluxo de login com Google:", error);
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
