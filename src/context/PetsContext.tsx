
'use client';

import { Stethoscope, Syringe, ClipboardList } from 'lucide-react';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, doc, updateDoc, arrayUnion, deleteDoc, onSnapshot, Unsubscribe, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type HealthHistoryItem = {
  date: string;
  type: 'Consulta' | 'Emergência' | 'Exame' | 'Vacina';
  title: string;
  vet: string;
  details: string;
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

export type AddPetData = {
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  gender: 'Macho' | 'Fêmea' | string;
  notes?: string;
  avatarFile?: File;
};

export type UpdatePetData = Partial<AddPetData>;


type PetsContextType = {
  pets: PetWithAge[];
  addPet: (pet: AddPetData) => Promise<void>;
  updatePet: (id: string, updatedPet: UpdatePetData) => Promise<void>;
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
    
    let unsubscribe: Unsubscribe | undefined = undefined;
    
    if (user) {
      setLoading(true);
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

    } else if (!authLoading) {
      setPets([]);
      setLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);


  const addPet = async (petData: AddPetData) => {
    if (!user) throw new Error("Usuário não autenticado.");

    let avatarUrl = `https://picsum.photos/seed/${petData.name}/200/200`;
    if (petData.avatarFile) {
        const storageRef = ref(storage, `pets_avatars/${user.uid}/${Date.now()}_${petData.avatarFile.name}`);
        await uploadBytes(storageRef, petData.avatarFile);
        avatarUrl = await getDownloadURL(storageRef);
    }

    const { avatarFile, notes, ...restOfPetData } = petData;

    const newPetData = {
      ...restOfPetData,
      avatarUrl,
      avatarHint: `${petData.species} ${petData.breed}`,
      tutorId: user.uid,
      healthHistory: notes ? [{
        date: new Date().toISOString().split('T')[0],
        type: 'Consulta' as const,
        title: 'Notas Iniciais',
        vet: 'Sistema',
        details: `Notas: ${notes}`,
      }] : [],
    };
    
    await addDoc(collection(db, "pets"), newPetData);
  };

  const updatePet = async (id: string, petData: UpdatePetData) => {
     if (!user) throw new Error("Usuário não autenticado.");
     const petRef = doc(db, 'pets', id);
     
     let updatedData: Partial<Pet> = {};

      if (petData.avatarFile) {
        const storageRef = ref(storage, `pets_avatars/${user.uid}/${Date.now()}_${petData.avatarFile.name}`);
        await uploadBytes(storageRef, petData.avatarFile);
        updatedData.avatarUrl = await getDownloadURL(storageRef);
    }

    const { avatarFile, notes, ...restOfPetData } = petData;
    updatedData = { ...updatedData, ...restOfPetData };

     await updateDoc(petRef, updatedData);
  };

  const deletePet = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const petRef = doc(db, 'pets', id);
    await deleteDoc(petRef);
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
