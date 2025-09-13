
'use client';

import PortalSidebar from '@/components/vetcare/PortalSidebar';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { useAuth } from '@/context/AuthContext';
import { PetsProvider } from '@/context/PetsContext';
import { TutorProvider } from '@/context/TutorContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import React from 'react';

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    // AuthProvider já mostra um spinner global, então aqui podemos apenas esperar.
    return null;
  }

  if (!user) {
    // Redireciona se não houver usuário após o carregamento da autenticação.
    // O useEffect no AuthContext já cuida disso, mas é uma salvaguarda.
    router.push('/login');
    return null; 
  }

  // O conteúdo do portal só será renderizado se houver um usuário.
  // Os provedores de contexto internos cuidarão de seus próprios estados de carregamento.
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
