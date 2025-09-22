
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, Unsubscribe, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

// Tipos de dados
export type TimeBreak = {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

export type DayAvailability = {
  dayOfWeek: string; // 'monday', 'tuesday', etc.
  isEnabled: boolean;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  breaks: TimeBreak[];
};

export type StaffMember = {
  id: string; // Firestore document ID
  name: string;
  role: string;
  isActive: boolean;
  availability: DayAvailability[];
};

type StaffContextType = {
  staff: StaffMember[];
  addStaffMember: (member: Omit<StaffMember, 'id'>) => Promise<void>;
  updateStaffMember: (id: string, member: Partial<Omit<StaffMember, 'id'>>) => Promise<void>;
  deleteStaffMember: (id: string) => Promise<void>;
  loading: boolean;
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isProfessional, loading: authLoading } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isProfessional) {
        setStaff([]);
        setLoading(false);
        return;
    };

    setLoading(true);
    const staffCollection = collection(db, 'staff');
    const unsubscribe = onSnapshot(staffCollection, (querySnapshot) => {
      const allStaff: StaffMember[] = [];
      querySnapshot.forEach((doc) => {
        allStaff.push({ id: doc.id, ...(doc.data() as Omit<StaffMember, 'id'>) });
      });
      setStaff(allStaff.sort((a,b) => a.name.localeCompare(b.name)));
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar equipe: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isProfessional, authLoading]);

  const addStaffMember = async (member: Omit<StaffMember, 'id'>) => {
    if (!isProfessional) throw new Error('Apenas profissionais podem gerenciar a equipe.');
    await addDoc(collection(db, 'staff'), member);
  };
  
  const updateStaffMember = async (id: string, member: Partial<Omit<StaffMember, 'id'>>) => {
    if (!isProfessional) throw new Error('Apenas profissionais podem gerenciar a equipe.');
    const memberRef = doc(db, 'staff', id);
    await updateDoc(memberRef, member);
  };
  
  const deleteStaffMember = async (id: string) => {
    if (!isProfessional) throw new Error('Apenas profissionais podem gerenciar a equipe.');
    await deleteDoc(doc(db, 'staff', id));
  };


  return (
    <StaffContext.Provider value={{ staff, addStaffMember, updateStaffMember, deleteStaffMember, loading }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};
