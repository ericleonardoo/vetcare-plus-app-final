
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, onSnapshot, Unsubscribe, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { useInventory } from './InventoryContext';

export type InvoiceStatus = 'Pendente' | 'Pago' | 'Atrasado';

export type InvoiceItem = {
    inventoryId?: string; // ID do item no inventário, se aplicável
    description: string;
    quantity: number;
    unitPrice: number;
};

export type Invoice = {
  id: string; // Firestore document ID
  invoiceId: string;
  clientId: string;
  petId: string;
  petName: string;
  appointmentId?: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  createdAt: Timestamp;
  paidAt?: Timestamp;
};

type InvoicesContextType = {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceId' | 'createdAt' | 'totalAmount'>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  loading: boolean;
};


const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

export const InvoicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { updateStock } = useInventory();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    setLoading(true);
    let unsubscribe: Unsubscribe | undefined = undefined;

    if (user) {
        const invoicesCollection = collection(db, 'invoices');
        let q;

        if (user.email?.includes('vet')) {
            // Profissional pode ver todas as faturas
            q = query(invoicesCollection);
        } else {
            // Cliente só pode ver as suas
            q = query(invoicesCollection, where('clientId', '==', user.uid));
        }

        unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allInvoices: Invoice[] = [];
            querySnapshot.forEach((doc) => {
                allInvoices.push({ id: doc.id, ...(doc.data() as Omit<Invoice, 'id'>) });
            });
            setInvoices(allInvoices);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar faturas: ", error);
            setLoading(false);
        });

    } else {
        setInvoices([]);
        setLoading(false);
    }

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [user, authLoading]);


  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceId' | 'createdAt' | 'totalAmount'>) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const totalAmount = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const invoiceCount = (await getDocs(collection(db, 'invoices'))).size;
    const invoiceId = `FAT-${String(invoiceCount + 1).padStart(5, '0')}`;

    const newInvoiceData = {
      ...invoiceData,
      invoiceId,
      totalAmount,
      createdAt: Timestamp.now(),
      paidAt: invoiceData.status === 'Pago' ? Timestamp.now() : null,
    };

    await addDoc(collection(db, "invoices"), newInvoiceData);

    // Se a fatura for registrada como paga, deduz o estoque
    if (newInvoiceData.status === 'Pago') {
        const itemsToUpdate = newInvoiceData.items
            .filter(item => item.inventoryId)
            .map(item => ({ id: item.inventoryId!, quantity: item.quantity }));
        
        if (itemsToUpdate.length > 0) {
            await updateStock(itemsToUpdate);
        }
    }
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    if (!user || !user.email?.includes('vet')) throw new Error("Apenas profissionais podem alterar o status.");

    const invoiceRef = doc(db, 'invoices', id);
    const invoiceToUpdate = invoices.find(inv => inv.id === id);
    
    if (!invoiceToUpdate) {
        throw new Error("Fatura não encontrada.");
    }
    
    const updateData: { status: InvoiceStatus; paidAt?: Timestamp } = { status };

    if (status === 'Pago') {
      updateData.paidAt = Timestamp.now();
    }

    await updateDoc(invoiceRef, updateData);

    // Se o status mudou para PAGO, deduz o estoque
    if (status === 'Pago' && invoiceToUpdate.status !== 'Pago') {
         const itemsToUpdate = invoiceToUpdate.items
            .filter(item => item.inventoryId)
            .map(item => ({ id: item.inventoryId!, quantity: item.quantity }));
        
        if (itemsToUpdate.length > 0) {
            await updateStock(itemsToUpdate);
        }
    }
  };


  return (
    <InvoicesContext.Provider value={{ invoices, addInvoice, updateInvoiceStatus, loading }}>
      {children}
    </InvoicesContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoicesContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  return context;
};
