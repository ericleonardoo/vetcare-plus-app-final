'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export type Tutor = {
  name: string;
  email: string;
  phone: string;
};

type TutorContextType = {
  tutor: Tutor | null;
  updateTutor: (tutorData: Partial<Tutor>) => void;
  loading: boolean;
};

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorData = async () => {
      if (user) {
        const docRef = doc(db, 'tutors', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTutor(docSnap.data() as Tutor);
        } else {
          // Se não existir, cria um perfil inicial com os dados do Auth
           const initialTutorData: Tutor = {
            name: user.displayName || 'Novo Tutor',
            email: user.email || '',
            phone: user.phoneNumber || '',
          };
          await setDoc(docRef, initialTutorData);
          setTutor(initialTutorData);
        }
        setLoading(false);
      } else {
        setLoading(false);
        setTutor(null);
      }
    };

    fetchTutorData();
  }, [user]);


  const updateTutor = (tutorData: Partial<Tutor>) => {
    setTutor((prevTutor) => (prevTutor ? { ...prevTutor, ...tutorData } : null));
  };

   if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando dados do tutor...</p>
            </div>
        </div>
    )
  }

  return (
    <TutorContext.Provider value={{ tutor, updateTutor, loading }}>
      {children}
    </TutorContext.Provider>
  );
};

export const useTutor = () => {
  const context = useContext(TutorContext);
  if (context === undefined) {
    throw new Error('useTutor must be used within a TutorProvider');
  }
  return context;
};
