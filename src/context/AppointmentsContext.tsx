'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';


export type AppointmentStatus = 'Confirmado' | 'Agendado' | 'Realizado';

export type Appointment = {
  id: string; // Firestore document ID
  tutorId: string;
  petId: string;
  petName: string;
  service: string;
  date: string; // ISO string
  status: AppointmentStatus;
  vet: string;
};

type AppointmentsContextType = {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'tutorId'>, vet?: string) => Promise<void>;
  loading: boolean;
};


const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const AppointmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [vets] = useState(['Dra. Emily Carter', 'Dr. Ben Jacobs']);

  useEffect(() => {
    if (authLoading) {
      // Se a autenticação ainda está carregando, não faça nada.
      return;
    }
    
    setLoading(true);
    let unsubscribe: Unsubscribe | undefined = undefined;

    if (user) {
        // Usuário logado, busca os agendamentos
        const appointmentsCollection = collection(db, 'appointments');
        let q;

        if (user.email?.includes('vet')) {
            // Profissional pode ver todos os agendamentos
            q = query(appointmentsCollection);
        } else {
            // Cliente só pode ver os seus
            q = query(appointmentsCollection, where('tutorId', '==', user.uid));
        }

        unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allAppointments: Appointment[] = [];
            querySnapshot.forEach((doc) => {
                allAppointments.push({ id: doc.id, ...(doc.data() as Omit<Appointment, 'id'>) });
            });
            setAppointments(allAppointments);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar agendamentos: ", error);
            setLoading(false);
        });

    } else {
        // Nenhum usuário logado, estado vazio
        setAppointments([]);
        setLoading(false);
    }

    // Função de limpeza para desinscrever do listener do onSnapshot
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [user, authLoading]);


  const addAppointment = async (appointmentData: Omit<Appointment, 'id'|'tutorId'>, vet?: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const newAppointmentData = {
      ...appointmentData,
      tutorId: user.uid,
      vet: vet || vets[Math.floor(Math.random() * vets.length)],
    };

    await addDoc(collection(db, "appointments"), newAppointmentData);
    // Não é mais necessário atualizar o estado localmente, o onSnapshot fará isso.
  };

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, loading }}>
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
};
