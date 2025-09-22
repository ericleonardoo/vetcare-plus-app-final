'use client';

import { scheduleHumanFollowUp, ScheduleHumanFollowUpInput, getNotifications, clearNotifications as clearApi } from '@/lib/actions';
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

// O tipo de output é definido aqui para evitar importações circulares ou exports inválidos.
export type ChatNotification = {
  id: number;
  userName: string;
  userContact: string;
  reason: string;
  timestamp: string;
};

type NotificationsContextType = {
  notifications: ChatNotification[];
  addNotification: (notification: ScheduleHumanFollowUpInput) => void;
  clearNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);

  useEffect(() => {
    // Carrega as notificações iniciais do backend em memória.
    const fetchNotifications = async () => {
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.data);
      }
    };
    fetchNotifications();
  }, []);

  const addNotification = useCallback(async (notification: ScheduleHumanFollowUpInput) => {
    const result = await scheduleHumanFollowUp(notification);
    if (result.success && result.data) {
        // Atualiza o estado local com a nova notificação retornada.
        setNotifications((prev) => [...prev, result.data!]);
    } else {
        console.error("Falha ao criar notificação:", result.error);
    }
  }, []);
  
  const clearNotifications = useCallback(async () => {
    await clearApi();
    setNotifications([]);
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
