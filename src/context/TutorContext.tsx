'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Tutor = {
  name: string;
  email: string;
  phone: string;
};

type TutorContextType = {
  tutor: Tutor;
  updateTutor: (tutorData: Partial<Tutor>) => void;
};

const initialTutor: Tutor = {
  name: 'Maria Silva',
  email: 'maria.silva@exemplo.com',
  phone: '(11) 98765-4321',
};

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tutor, setTutor] = useState<Tutor>(initialTutor);

  const updateTutor = (tutorData: Partial<Tutor>) => {
    setTutor((prevTutor) => ({ ...prevTutor, ...tutorData }));
  };

  return (
    <TutorContext.Provider value={{ tutor, updateTutor }}>
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
