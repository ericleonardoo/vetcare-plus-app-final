'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, onSnapshot, Unsubscribe, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tutor } from './TutorContext';

type FullTutor = Tutor & { id: string };

type TutorsContextType = {
  tutors: FullTutor[];
  loading: boolean;
};

const TutorsContext = createContext<TutorsContextType | undefined>(undefined);

export const TutorsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [tutors, setTutors] = useState<FullTutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    let unsubscribe: Unsubscribe | undefined = undefined;
    
    if (user && user.email?.includes('vet')) {
      // Only professional users can load all tutors
      setLoading(true);
      const tutorsCollection = collection(db, 'tutors');
      const q = query(tutorsCollection);

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const allTutors: FullTutor[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Tutor;
          allTutors.push({ ...data, id: doc.id });
        });
        setTutors(allTutors);
        setLoading(false);
      }, (error) => {
        console.error("Erro ao buscar tutores: ", error);
        setLoading(false);
      });

    } else if (!authLoading) {
      setTutors([]);
      setLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);

  return (
    <TutorsContext.Provider value={{ tutors, loading }}>
      {children}
    </TutorsContext.Provider>
  );
};

export const useTutors = () => {
  const context = useContext(TutorsContext);
  if (context === undefined) {
    throw new Error('useTutors must be used within a TutorsProvider');
  }
  return context;
};

    