
'use client';

import ProfessionalSidebar from '@/components/vetcare/ProfessionalSidebar';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { PetsProvider } from '@/context/PetsContext';
import { TutorsProvider } from '@/context/TutorsContext';
import ProfessionalHeader from '@/components/vetcare/ProfessionalHeader';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { InvoicesProvider } from '@/context/InvoicesContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { StaffProvider } from '@/context/StaffContext';

export default function ProfessionalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const { user, isProfessional, loading: authLoading } = useAuth();
   const router = useRouter();

   if (authLoading) {
    return null;
  }

  // Redireciona se não for um profissional, garantindo a segurança da rota.
  if (!isProfessional) {
    router.push('/login');
    return null;
  }

  return (
    <TutorsProvider>
      <PetsProvider>
        <AppointmentsProvider>
          <NotificationsProvider>
             <InventoryProvider>
                <InvoicesProvider>
                  <StaffProvider>
                    <div className="flex min-h-screen w-full bg-muted/40">
                    <ProfessionalSidebar />
                    <div className="flex flex-1 flex-col">
                        <ProfessionalHeader />
                        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
                        {children}
                        </main>
                    </div>
                    </div>
                  </StaffProvider>
                </InvoicesProvider>
            </InventoryProvider>
          </NotificationsProvider>
        </AppointmentsProvider>
      </PetsProvider>
    </TutorsProvider>
  );
}
