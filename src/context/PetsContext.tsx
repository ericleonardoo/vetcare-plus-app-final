'use client';

import { Stethoscope, Syringe, ClipboardList } from 'lucide-react';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';

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

const initialPets: PetWithAge[] = [];

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
    return `${ageYears} anos`;
}


const PetsContext = createContext<PetsContextType | undefined>(undefined);

export const PetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<PetWithAge[]>(initialPets);
  const [loading, setLoading] = useState(true);

  const fetchPets = useCallback(async () => {
    if (!user) {
      setPets([]);
      setLoading(false);
      return;
    };
    setLoading(true);
    try {
      const petsCollection = collection(db, 'pets');
      const q = query(petsCollection, where('tutorId', '==', user.uid));
      const querySnapshot = await getDocs(q);
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
    } catch (error) {
      console.error("Erro ao buscar pets: ", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Para um ambiente multi-usuário real, você pode querer buscar todos os pets
    // se o usuário for um profissional. Por enquanto, mantemos a lógica do tutor.
    if (user?.email?.includes('vet')) {
        fetchAllPets();
    } else {
        fetchPets();
    }
  }, [user, fetchPets]);

   const fetchAllPets = useCallback(async () => {
    setLoading(true);
    try {
      const petsCollection = collection(db, 'pets');
      const querySnapshot = await getDocs(petsCollection);
      const allPets: PetWithAge[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Pet, 'id'>;
        allPets.push({ 
            ...data, 
            id: doc.id,
            age: calculateAge(data.birthDate),
            healthHistory: data.healthHistory ? data.healthHistory.map(hh => ({...hh, icon: iconMapping[hh.type]})) : []
        });
      });
      setPets(allPets);
    } catch (error) {
      console.error("Erro ao buscar todos os pets: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPet = async (petData: Omit<Pet, 'id' | 'tutorId'|'healthHistory'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const newPetData = {
      ...petData,
      tutorId: user.uid,
      healthHistory: [],
    };
    
    const docRef = await addDoc(collection(db, "pets"), newPetData);
    
    setPets((prevPets) => [
        ...prevPets, 
        { 
            ...newPetData, 
            id: docRef.id, 
            age: calculateAge(newPetData.birthDate),
            healthHistory: [] 
        }
    ]);
  };

  const updatePet = async (id: string, updatedPetData: Partial<Omit<Pet, 'id' | 'tutorId'>>) => {
     if (!user) throw new Error("Usuário não autenticado.");
     const petRef = doc(db, 'pets', id);
     await updateDoc(petRef, updatedPetData);

     setPets(prevPets => prevPets.map(p => 
        p.id === id ? { ...p, ...updatedPetData, age: calculateAge(updatedPetData.birthDate || p.birthDate) } : p
     ));
  };

  const deletePet = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const petRef = doc(db, 'pets', id);
    await deleteDoc(petRef);
    setPets(prevPets => prevPets.filter(p => p.id !== id));
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

     setPets(prevPets => prevPets.map(p => {
         if (p.id === petId) {
             return {
                 ...p,
                 healthHistory: [...p.healthHistory, {...newEntry, icon: iconMapping[newEntry.type]}]
             }
         }
         return p;
     }));
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
