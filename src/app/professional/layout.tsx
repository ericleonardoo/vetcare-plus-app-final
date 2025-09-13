
'use client';

import ProfessionalSidebar from '@/components/vetcare/ProfessionalSidebar';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { PetsProvider } from '@/context/PetsContext';
import { TutorsProvider } from '@/context/TutorsContext';
import ProfessionalHeader from '@/components/vetcare/ProfessionalHeader';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfessionalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const { user, loading: authLoading } = useAuth();
   const router = useRouter();

   if (authLoading) {
    return null;
  }

  if (!user || !user.email?.includes('vet')) {
    router.push('/login');
    return null;
  }

  return (
    <TutorsProvider>
      <PetsProvider>
        <AppointmentsProvider>
          <NotificationsProvider>
            <div className="flex min-h-screen w-full bg-muted/40">
              <ProfessionalSidebar />
              <div className="flex flex-1 flex-col">
                 <ProfessionalHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
                  {children}
                </main>
              </div>
            </div>
          </NotificationsProvider>
        </AppointmentsProvider>
      </PetsProvider>
    </TutorsProvider>
  );
}

    