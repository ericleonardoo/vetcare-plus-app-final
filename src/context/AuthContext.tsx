
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, getRedirectResult } from 'firebase/auth';
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
      setLoading(true);
      if (user) {
        setUser(user);
        await handleUserSession(user);
      } else {
        setUser(null);
        setIsProfessional(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUserSession = async (user: User) => {
    const userDocRef = doc(db, 'tutors', user.uid);
    const userDoc = await getDoc(userDocRef);

    let userData;
    if (userDoc.exists()) {
        userData = userDoc.data();
        if (userData.role === 'professional') {
            setIsProfessional(true);
        } else {
            setIsProfessional(false);
        }
    } else {
        // This should not happen with the new logic, but as a fallback
        const role = sessionStorage.getItem('google_signup_role') || 'customer';
        userData = {
            name: user.displayName,
            email: user.email,
            phone: user.phoneNumber || '',
            role: role,
        };
        await setDoc(userDocRef, userData);
        setIsProfessional(role === 'professional');
        sessionStorage.removeItem('google_signup_role');
    }

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro');
    const isProfileComplete = userData.phone && userData.phone.trim() !== '';

    if (!isProfileComplete && pathname !== '/cadastro/completar-perfil') {
        router.push('/cadastro/completar-perfil');
    } else if (isProfileComplete && (isAuthPage || pathname === '/cadastro/completar-perfil')) {
        router.push(userData.role === 'professional' ? '/professional/dashboard' : '/portal/dashboard');
    }

    setLoading(false);
  };
  
  useEffect(() => {
    if (!loading && !user) {
        const isPublicPage = !pathname.startsWith('/portal') && !pathname.startsWith('/professional');
        if (!isPublicPage) {
            router.push('/login');
        }
    }
  }, [user, loading, pathname, router]);


  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
      const provider = new GoogleAuthProvider();
      
      // Store role in case this is a new signup
      sessionStorage.setItem('google_signup_role', role);

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(db, "tutors", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName,
                email: user.email,
                phone: user.phoneNumber || '',
                role: sessionStorage.getItem('google_signup_role') || 'customer',
            });
        }
        sessionStorage.removeItem('google_signup_role');
        
      } catch (error) {
          sessionStorage.removeItem('google_signup_role');
          console.error("Erro no signInWithPopup:", error);
          throw error; // Re-throw the error to be caught by the UI
      }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
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
