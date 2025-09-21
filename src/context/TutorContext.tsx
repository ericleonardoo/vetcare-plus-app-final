
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export type Tutor = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type TutorContextType = {
  tutor: Tutor | null;
  updateTutor: (tutorData: Partial<Omit<Tutor, 'id'>>) => void;
  loading: boolean;
};

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setTutor(null);
      setLoading(!authLoading);
      return;
    }

    const docRef = doc(db, 'tutors', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTutor({ id: docSnap.id, ...docSnap.data() } as Tutor);
      } else {
        // This case should be rare now since registration creates the doc
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro no listener do tutor:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);


  const updateTutor = (tutorData: Partial<Tutor>) => {
    setTutor((prevTutor) => (prevTutor ? { ...prevTutor, ...tutorData } : null));
  };


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


    