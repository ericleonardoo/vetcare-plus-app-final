
'use client';

import PortalSidebar from '@/components/vetcare/PortalSidebar';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { useAuth } from '@/context/AuthContext';
import { PetsProvider } from '@/context/PetsContext';
import { TutorProvider } from '@/context/TutorContext';
import { useRouter } from 'next/navigation';
import React from 'react';
import PortalHeader from '@/components/vetcare/PortalHeader';
import { InvoicesProvider } from '@/context/InvoicesContext';
import { Loader2 } from 'lucide-react';

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading: authLoading, isProfessional } = useAuth();
  const router = useRouter();

  if (authLoading) {
    // O AuthProvider já mostra um spinner global, então aqui podemos apenas esperar.
    return null;
  }

  if (!user || isProfessional) {
    // Redireciona se não houver usuário ou se for um profissional tentando acessar o portal do cliente.
    // O AuthContext já lida com grande parte disso, mas é uma salvaguarda.
    router.push('/login');
    return null; 
  }

  return (
    <TutorProvider>
      <PetsProvider>
        <AppointmentsProvider>
          <InvoicesProvider>
            <div className="flex min-h-screen w-full bg-secondary">
              <PortalSidebar />
              <div className="flex flex-1 flex-col">
                <PortalHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
              </div>
            </div>
          </InvoicesProvider>
        </AppointmentsProvider>
      </PetsProvider>
    </TutorProvider>
  );
}
