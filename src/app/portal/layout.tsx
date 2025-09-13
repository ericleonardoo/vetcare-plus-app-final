
'use client';

import PortalSidebar from '@/components/vetcare/PortalSidebar';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { useAuth } from '@/context/AuthContext';
import { PetsProvider } from '@/context/PetsContext';
import { TutorProvider } from '@/context/TutorContext';
import { useRouter } from 'next/navigation';

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return null; // A tela de carregamento principal já está sendo exibida pelo AuthProvider
  }

  if (!user) {
    router.push('/login');
    return null; // Evita renderizar o conteúdo do portal enquanto redireciona
  }

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
