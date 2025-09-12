import ProfessionalSidebar from '@/components/vetcare/ProfessionalSidebar';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { PetsProvider } from '@/context/PetsContext';
import { TutorProvider } from '@/context/TutorContext';

export default function ProfessionalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TutorProvider>
      <PetsProvider>
        <AppointmentsProvider>
          <NotificationsProvider>
            <div className="flex min-h-screen w-full bg-muted/40">
              <ProfessionalSidebar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
                {children}
              </main>
            </div>
          </NotificationsProvider>
        </AppointmentsProvider>
      </PetsProvider>
    </TutorProvider>
  );
}
