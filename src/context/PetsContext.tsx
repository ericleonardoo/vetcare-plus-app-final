'use client';

import { Stethoscope, Syringe, ClipboardList } from 'lucide-react';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

export type HealthHistoryItem = {
  date: string;
  type: 'Consulta' | 'Emergência' | 'Exame' | 'Vacina';
  title: string;
  vet: string;
  details: string;
  // O ícone não será armazenado no firestore, será mapeado no frontend.
};

export type Pet = {
  id: string; // Firestore document ID
  tutorId: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  gender: 'Macho' | 'Fêmea' | string;
  avatarUrl: string;
  avatarHint: string;
  healthHistory: (Omit<HealthHistoryItem, 'icon'>)[];
};

type PetWithAge = Pet & { age: string; healthHistory: (HealthHistoryItem & {icon: React.ElementType})[] };


type PetsContextType = {
  pets: PetWithAge[];
  addPet: (pet: Omit<Pet, 'id' | 'tutorId' | 'healthHistory'>) => Promise<void>;
  updatePet: (id: string, updatedPet: Partial<Omit<Pet, 'id' | 'tutorId'>>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  addHealthHistoryEntry: (petId: string, entry: Omit<HealthHistoryItem, 'icon'|'date'>) => Promise<void>;
  loading: boolean;
};

const iconMapping = {
    'Consulta': Stethoscope,
    'Emergência': Stethoscope,
    'Exame': ClipboardList,
    'Vacina': Syringe,
};

const calculateAge = (birthDate: string): string => {
    if (!birthDate) return 'Idade desconhecida';
    const birth = new Date(birthDate);
    const today = new Date();
    let ageYears = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        ageYears--;
    }
    let ageMonths = today.getMonth() - birth.getMonth();
    if (ageMonths < 0) {
        ageMonths += 12;
    }

    if(ageYears > 0) {
      return `${ageYears} ano(s)`;
    }
    return `${ageMonths} mes(es)`;
}


const PetsContext = createContext<PetsContextType | undefined>(undefined);

export const PetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<PetWithAge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    setLoading(true);
    let unsubscribe: Unsubscribe | undefined = undefined;
    
    if (user) {
      const petsCollection = collection(db, 'pets');
      let q;

      if (user.email?.includes('vet')) {
          q = query(petsCollection); // Profissional vê todos os pets
      } else {
          q = query(petsCollection, where('tutorId', '==', user.uid)); // Cliente vê apenas os seus
      }

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userPets: PetWithAge[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Pet, 'id'>;
          userPets.push({ 
              ...data, 
              id: doc.id,
              age: calculateAge(data.birthDate),
              healthHistory: data.healthHistory ? data.healthHistory.map(hh => ({...hh, icon: iconMapping[hh.type]})) : []
          });
        });
        setPets(userPets);
        setLoading(false);
      }, (error) => {
        console.error("Erro ao buscar pets: ", error);
        setLoading(false);
      });

    } else {
      setPets([]);
      setLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);


  const addPet = async (petData: Omit<Pet, 'id' | 'tutorId'|'healthHistory'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const newPetData = {
      ...petData,
      tutorId: user.uid,
      healthHistory: [],
    };
    
    await addDoc(collection(db, "pets"), newPetData);
    // O onSnapshot vai cuidar de atualizar a lista.
  };

  const updatePet = async (id: string, updatedPetData: Partial<Omit<Pet, 'id' | 'tutorId'>>) => {
     if (!user) throw new Error("Usuário não autenticado.");
     const petRef = doc(db, 'pets', id);
     await updateDoc(petRef, updatedPetData);
     // O onSnapshot vai cuidar de atualizar a lista.
  };

  const deletePet = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const petRef = doc(db, 'pets', id);
    await deleteDoc(petRef);
    // O onSnapshot vai cuidar de atualizar a lista.
  };
  
  const addHealthHistoryEntry = async (petId: string, entry: Omit<HealthHistoryItem, 'icon'|'date'>) => {
     if (!user) throw new Error("Usuário não autenticado.");
     
     const newEntry = {
         ...entry,
         date: new Date().toISOString().split('T')[0],
     }

     const petRef = doc(db, 'pets', petId);
     await updateDoc(petRef, {
         healthHistory: arrayUnion(newEntry)
     });
     // O onSnapshot vai cuidar de atualizar a lista.
  };

  return (
    <PetsContext.Provider value={{ pets, addPet, updatePet, deletePet, addHealthHistoryEntry, loading }}>
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
