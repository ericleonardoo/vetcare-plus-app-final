'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, Unsubscribe, addDoc, doc, updateDoc, deleteDoc, writeBatch, runTransaction } from 'firebase/firestore';

export type InventoryItem = {
  id: string; // Firestore document ID
  productName: string;
  description: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
};

type InventoryContextType = {
  inventory: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<Omit<InventoryItem, 'id'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateStock: (items: { id: string; quantity: number }[]) => Promise<void>;
  loading: boolean;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let unsubscribe: Unsubscribe | undefined = undefined;

    if (user && user.email?.includes('vet')) {
      setLoading(true);
      const inventoryCollection = collection(db, 'inventory');
      unsubscribe = onSnapshot(inventoryCollection, (querySnapshot) => {
        const allItems: InventoryItem[] = [];
        querySnapshot.forEach((doc) => {
          allItems.push({ id: doc.id, ...(doc.data() as Omit<InventoryItem, 'id'>) });
        });
        setInventory(allItems.sort((a,b) => a.productName.localeCompare(b.productName)));
        setLoading(false);
      }, (error) => {
        console.error("Erro ao buscar inventário: ", error);
        setLoading(false);
      });
    } else {
      setInventory([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    if (!user || !user.email?.includes('vet')) throw new Error('Apenas profissionais podem gerenciar o estoque.');
    await addDoc(collection(db, 'inventory'), item);
  };

  const updateItem = async (id: string, item: Partial<Omit<InventoryItem, 'id'>>) => {
    if (!user || !user.email?.includes('vet')) throw new Error('Apenas profissionais podem gerenciar o estoque.');
    const itemRef = doc(db, 'inventory', id);
    await updateDoc(itemRef, item);
  };

  const deleteItem = async (id: string) => {
    if (!user || !user.email?.includes('vet')) throw new Error('Apenas profissionais podem gerenciar o estoque.');
    const itemRef = doc(db, 'inventory', id);
    await deleteDoc(itemRef);
  };
  
  const updateStock = async (itemsToUpdate: { id: string; quantity: number }[]) => {
    if (!user || !user.email?.includes('vet')) throw new Error('Apenas profissionais podem gerenciar o estoque.');

    try {
        await runTransaction(db, async (transaction) => {
            for (const item of itemsToUpdate) {
                if (!item.id) continue; // Pula itens sem ID de inventário

                const itemRef = doc(db, "inventory", item.id);
                const itemDoc = await transaction.get(itemRef);
                
                if (!itemDoc.exists()) {
                    throw `Produto com ID ${item.id} não encontrado no estoque.`;
                }

                const currentQuantity = itemDoc.data().quantity;
                const newQuantity = currentQuantity - item.quantity;

                if (newQuantity < 0) {
                    throw `Estoque insuficiente para ${itemDoc.data().productName}.`;
                }

                transaction.update(itemRef, { quantity: newQuantity });
            }
        });
        console.log("Transação de estoque concluída com sucesso!");
    } catch (error) {
        console.error("Erro na transação de estoque: ", error);
        throw error; // Propaga o erro para ser tratado no UI
    }
  };

  return (
    <InventoryContext.Provider value={{ inventory, addItem, updateItem, deleteItem, updateStock, loading }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
