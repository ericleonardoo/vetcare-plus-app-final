'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Pet } from './PetsContext';

export type AppointmentStatus = 'Confirmado' | 'Agendado' | 'Realizado';

export type Appointment = {
  id: number;
  petId: number;
  petName: string;
  service: string;
  date: string; // ISO string
  status: AppointmentStatus;
  vet: string;
};

type AppointmentsContextType = {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>, vet?: string) => void;
};

const initialAppointments: Appointment[] = [
    { id: 1, petId: 1, petName: 'Paçoca', service: 'Check-up de Rotina', date: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), status: 'Confirmado' as const, vet: 'Dra. Emily Carter' },
    { id: 2, petId: 2, petName: 'Whiskers', service: 'Vacinação Anual', date: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(), status: 'Confirmado' as const, vet: 'Dr. Ben Jacobs' },
    { id: 3, petId: 1, petName: 'Paçoca', service: 'Limpeza Dental', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), status: 'Realizado' as const, vet: 'Dra. Emily Carter' },
    { id: 4, petId: 2, petName: 'Whiskers', service: 'Consulta de Emergência', date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(), status: 'Realizado' as const, vet: 'Dr. Ben Jacobs' },
    { id: 5, petId: 1, petName: 'Paçoca', service: 'Consulta para Cirurgia', date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), status: 'Agendado' as const, vet: 'Dr. Ben Jacobs' },
];


const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const AppointmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [vets] = useState(['Dra. Emily Carter', 'Dr. Ben Jacobs']);

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'vet'>, vet?: string) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now(),
      vet: vet || vets[Math.floor(Math.random() * vets.length)], // Atribui um veterinário específico ou aleatório
    };
    setAppointments((prevAppointments) => [...prevAppointments, newAppointment]);
  };

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment }}>
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
