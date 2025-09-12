'use client';

import { Stethoscope, Syringe, ClipboardList } from 'lucide-react';
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type HealthHistoryItem = {
  date: string;
  type: 'Consulta' | 'Emergência' | 'Exame' | 'Vacina';
  title: string;
  vet: string;
  details: string;
  icon: React.ElementType;
};

export type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: string;
  birthDate: string;
  gender: 'Macho' | 'Fêmea' | string;
  avatarUrl: string;
  avatarHint: string;
  healthHistory: HealthHistoryItem[];
};

type PetsContextType = {
  pets: Pet[];
  addPet: (pet: Omit<Pet, 'healthHistory' | 'id'> & { id?: number }) => void;
  updatePet: (id: number, updatedPet: Partial<Pet>) => void;
  deletePet: (id: number) => void;
  addHealthHistoryEntry: (petId: number, entry: HealthHistoryItem) => void;
};

const initialPets: Pet[] = [
  {
    id: 1,
    name: 'Paçoca',
    species: 'Cachorro',
    breed: 'Vira-lata Caramelo',
    get age() {
      const birthDate = new Date(this.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return `${age} anos`;
    },
    birthDate: '2021-05-10',
    gender: 'Macho',
    avatarUrl: 'https://picsum.photos/seed/brasil1/200/200',
    avatarHint: 'dog brazil',
    healthHistory: [
        { date: '2024-07-20', type: 'Consulta', title: 'Limpeza Dental', vet: 'Dra. Emily Carter', details: 'Procedimento de limpeza dental realizado com sucesso.', icon: Stethoscope },
        { date: '2024-03-10', type: 'Vacina', title: 'Vacina Polivalente (V10)', vet: 'Dra. Emily Carter', details: 'Dose de reforço anual da vacina V10.', icon: Syringe },
    ]
  },
  {
    id: 2,
    name: 'Whiskers',
    species: 'Gato',
    breed: 'Siamês',
     get age() {
      const birthDate = new Date(this.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return `${age} anos`;
    },
    birthDate: '2019-08-25',
    gender: 'Macho',
    avatarUrl: 'https://picsum.photos/seed/pet2/200/200',
    avatarHint: 'siamese cat',
     healthHistory: [
      { date: '2024-06-05', type: 'Emergência', title: 'Consulta de Emergência', vet: 'Dr. Ben Jacobs', details: 'Apresentou apatia e falta de apetite. Diagnosticado com infecção gástrica leve.', icon: Stethoscope },
      { date: '2023-12-15', type: 'Exame', title: 'Exames de Sangue', vet: 'Dr. Ben Jacobs', details: 'Hemograma completo e perfil bioquímico. Todos os resultados dentro dos parâmetros normais.', icon: ClipboardList },
    ]
  },
];


const PetsContext = createContext<PetsContextType | undefined>(undefined);

export const PetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>(initialPets);

  const addPet = (petData: Omit<Pet, 'healthHistory' | 'id'> & { id?: number }) => {
     const newPet: Pet = {
      id: petData.id || Date.now(),
      healthHistory: [],
      ...petData,
    };
    setPets((prevPets) => [...prevPets, newPet]);
  };

  const updatePet = (id: number, updatedPet: Partial<Pet>) => {
    setPets((prevPets) =>
      prevPets.map((pet) => (pet.id === id ? { ...pet, ...updatedPet } : pet))
    );
  };

  const deletePet = (id: number) => {
    setPets((prevPets) => prevPets.filter((pet) => pet.id !== id));
  };
  
  const addHealthHistoryEntry = (petId: number, entry: HealthHistoryItem) => {
    setPets(prevPets => 
        prevPets.map(pet => {
            if (pet.id === petId) {
                return {
                    ...pet,
                    healthHistory: [...pet.healthHistory, entry]
                };
            }
            return pet;
        })
    );
  };

  return (
    <PetsContext.Provider value={{ pets, addPet, updatePet, deletePet, addHealthHistoryEntry }}>
      {children}
    </PetsContext.Provider>
  );
};

export const usePets = () => {
  const context = useContext(PetsContext);
  if (context === undefined) {
    throw new Error('usePets must be used within a PetsProvider');
  }
  return context;
};

    