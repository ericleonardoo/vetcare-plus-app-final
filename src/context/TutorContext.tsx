'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
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
  const { user, loading: authLoading } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      // Se a autenticação ainda está carregando, não faça nada.
      return;
    }

    let unsubscribe: Unsubscribe | undefined = undefined;

    if (user) {
      // Usuário está logado, comece a buscar os dados do tutor
      setLoading(true);
      const docRef = doc(db, 'tutors', user.uid);
      
      unsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          setTutor(docSnap.data() as Tutor);
        } else {
          // Documento não existe, vamos criar um perfil inicial para este novo usuário
          try {
            const initialTutorData: Tutor = {
              name: user.displayName || 'Novo Tutor',
              email: user.email || '',
              phone: user.phoneNumber || '',
            };
            await setDoc(docRef, initialTutorData);
            // O onSnapshot será acionado novamente após a criação do doc, atualizando o estado
          } catch(error) {
            console.error("Erro ao criar documento do tutor:", error);
          }
        }
        setLoading(false);
      }, (error) => {
        console.error("Erro no listener do tutor:", error);
        setLoading(false);
      });

    } else {
      // Nenhum usuário logado, então limpe os dados e pare de carregar
      setTutor(null);
      setLoading(false);
    }
    
    // Função de limpeza para desinscrever do listener do onSnapshot
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [user, authLoading]);


  const updateTutor = (tutorData: Partial<Tutor>) => {
    // Esta função agora serve apenas para atualizações otimistas no lado do cliente,
    // se necessário, mas a fonte da verdade é o Firestore.
    // A atualização real deve ser feita via uma server action que modifica o Firestore.
    setTutor((prevTutor) => (prevTutor ? { ...prevTutor, ...tutorData } : null));
  };


  // Não exibe um spinner aqui, pois o layout pai ou a página que o consome
  // deve lidar com o estado de carregamento para evitar spinners múltiplos.
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
