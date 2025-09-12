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
  addAppointment: (appointment: Omit<Appointment, 'id' | 'vet'>) => void;
};

const initialAppointments: Appointment[] = [
    { id: 1, petId: 1, petName: 'Paçoca', service: 'Check-up de Rotina', date: '2024-08-15T10:00:00', status: 'Confirmado' as const, vet: 'Dra. Emily Carter' },
    { id: 2, petId: 2, petName: 'Whiskers', service: 'Vacinação Anual', date: '2024-08-22T14:30:00', status: 'Confirmado' as const, vet: 'Dr. Ben Jacobs' },
    { id: 3, petId: 1, petName: 'Paçoca', service: 'Limpeza Dental', date: '2024-07-20T11:00:00', status: 'Realizado' as const, vet: 'Dra. Emily Carter' },
    { id: 4, petId: 2, petName: 'Whiskers', service: 'Consulta de Emergência', date: '2024-06-05T16:20:00', status: 'Realizado' as const, vet: 'Dr. Ben Jacobs' },
    { id: 5, petId: 1, petName: 'Paçoca', service: 'Consulta para Cirurgia', date: '2024-09-02T09:00:00', status: 'Agendado' as const, vet: 'Dr. Ben Jacobs' },
];

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const AppointmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [vets] = useState(['Dra. Emily Carter', 'Dr. Ben Jacobs']);

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'vet'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now(),
      vet: vets[Math.floor(Math.random() * vets.length)], // Atribui um veterinário aleatoriamente
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
