'use client';

import { scheduleHumanFollowUp, ScheduleHumanFollowUpInput } from '@/lib/actions';
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

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

  const addNotification = useCallback(async (notification: ScheduleHumanFollowUpInput) => {
    
    // Call the server action which in turn calls the Genkit tool/flow
    const result = await scheduleHumanFollowUp(notification);

    if (result.success && result.data) {
        setNotifications((prev) => [...prev, result.data!]);
    } else {
        console.error("Falha ao criar notificação:", result.error);
        // Optionally, handle the error in the UI
    }
  }, []);
  
  const clearNotifications = () => {
    setNotifications([]);
  };

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
