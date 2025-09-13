'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';


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
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [vets] = useState(['Dra. Emily Carter', 'Dr. Ben Jacobs']);

  const fetchAppointments = useCallback(async () => {
    // No portal profissional, podemos querer buscar todos os agendamentos.
    // No portal do cliente, apenas os do tutor logado.
    // Por simplicidade do protótipo, vamos buscar todos por enquanto,
    // mas em produção, isso seria refinado com base no papel do usuário.
    setLoading(true);
    try {
        const appointmentsCollection = collection(db, 'appointments');
        const querySnapshot = await getDocs(appointmentsCollection);
        const allAppointments: Appointment[] = [];
        querySnapshot.forEach((doc) => {
            allAppointments.push({ id: doc.id, ...(doc.data() as Omit<Appointment, 'id'>) });
        });
        setAppointments(allAppointments);
    } catch (error) {
        console.error("Erro ao buscar agendamentos: ", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carrega os agendamentos quando o provedor é montado.
    fetchAppointments();
  }, [fetchAppointments]);


  const addAppointment = async (appointmentData: Omit<Appointment, 'id'|'tutorId'>, vet?: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const newAppointmentData = {
      ...appointmentData,
      tutorId: user.uid,
      vet: vet || vets[Math.floor(Math.random() * vets.length)],
    };

    const docRef = await addDoc(collection(db, "appointments"), newAppointmentData);
    
    // Atualiza o estado local para feedback imediato
    setAppointments((prevAppointments) => [
        ...prevAppointments, 
        { 
            ...newAppointmentData, 
            id: docRef.id,
        }
    ]);
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
