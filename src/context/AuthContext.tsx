// src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Definindo a estrutura do nosso perfil de usuário customizado
export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: 'customer' | 'professional';
  profileCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: (role?: 'customer' | 'professional') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'tutors', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    // O useEffect agora tem um array de dependências VAZIO.
    // Ele roda UMA VEZ e nunca mais, como deve ser.
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'tutors', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUserProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          phone: '', // Telefone começa vazio
          role: role,
          profileCompleted: false,
        };
        await setDoc(userDocRef, newUserProfile);
      }
      toast({ title: "Login realizado com sucesso!" });
      // A lógica de redirecionamento será tratada pelo AuthGuard
    } catch (error) {
      console.error("Erro no login com Google:", error);
      toast({ variant: "destructive", title: "Erro ao fazer login." });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
