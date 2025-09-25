// src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword } from 'firebase/auth';
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
  isProfessional: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: (role?: 'customer' | 'professional') => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfessional, setIsProfessional] = useState(false);
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
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          setIsProfessional(profile.role === 'professional');
        } else {
          // Documento do usuário não existe, pode ser um novo cadastro
          setUserProfile(null);
          setIsProfessional(false);
        }
      } else {
        setUserProfile(null);
        setIsProfessional(false);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
        await firebaseSignInWithEmailAndPassword(auth, email, pass);
        // O onAuthStateChanged vai cuidar de atualizar o estado do user e userProfile
        toast({ title: "Login realizado com sucesso!" });
    } catch (error) {
        console.error("Erro no login com Email:", error);
        throw error; // Re-lança o erro para a página de login tratar a UI
    } finally {
        setLoading(false);
    }
  };


  const signInWithGoogle = async (role: 'customer' | 'professional' = 'customer') => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'tutors', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUserProfileData = {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber || '',
          role: role,
          profileCompleted: !!(firebaseUser.phoneNumber),
        };
        await setDoc(userDocRef, newUserProfileData, { merge: true });
        
        setUserProfile({
          uid: firebaseUser.uid,
          ...newUserProfileData
        });
        setIsProfessional(role === 'professional');

      } else {
        // Se o usuário já existe, apenas carregue os dados
         const profile = userDoc.data() as UserProfile;
         setUserProfile(profile);
         setIsProfessional(profile.role === 'professional');
      }
      
      toast({ title: "Login realizado com sucesso!" });
      // A lógica de redirecionamento será tratada pelo AuthGuard
    } catch (error) {
      console.error("Erro no login com Google:", error);
      toast({ variant: "destructive", title: "Erro ao fazer login." });
      setLoading(false);
    } 
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isProfessional, loading, logout, signInWithGoogle, signInWithEmail }}>
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
