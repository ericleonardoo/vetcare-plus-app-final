import PortalSidebar from '@/components/vetcare/PortalSidebar';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { PetsProvider } from '@/context/PetsContext';
import { TutorProvider } from '@/context/TutorContext';

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TutorProvider>
      <PetsProvider>
        <AppointmentsProvider>
          <div className="flex min-h-screen w-full bg-secondary">
            <PortalSidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </AppointmentsProvider>
      </PetsProvider>
    </TutorProvider>
  );
}
