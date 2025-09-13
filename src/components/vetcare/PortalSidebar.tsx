import Link from 'next/link';
import {
  Home,
  Settings,
  Heart,
  Calendar,
  ClipboardList,
  LogOut,
  PawPrint,
  Wallet,
  Loader2
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { useAppointments } from '@/context/AppointmentsContext';
import { useMemo } from 'react';

export default function PortalSidebar() {
  const { user } = useAuth();
  const { appointments } = useAppointments();

  const handleLogout = () => {
    auth.signOut();
  }

  const upcomingAppointmentsCount = useMemo(() => 
    appointments.filter(apt => new Date(apt.date) >= new Date() && apt.tutorId === user?.uid).length,
    [appointments, user]
  );

  if (!user) {
    return (
      <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </aside>
    );
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
      <div className="flex h-16 items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <PawPrint className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground font-headline">VetCare+</span>
        </Link>
      </div>
      <Separator className='my-4' />
      <nav className="flex flex-col gap-2 text-sm font-medium">
        <Link
          href="/portal/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/portal/agendamentos"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Calendar className="h-4 w-4" />
          Agendamentos
          {upcomingAppointmentsCount > 0 && (
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              {upcomingAppointmentsCount}
            </Badge>
          )}
        </Link>
        <Link
          href="/portal/pets"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Heart className="h-4 w-4" />
          Meus Pets
        </Link>
        <Link
          href="/portal/historico"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <ClipboardList className="h-4 w-4" />
          Histórico de Saúde
        </Link>
         <Link
          href="/portal/financeiro"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Wallet className="h-4 w-4" />
          Financeiro
        </Link>
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <Separator className='mb-2' />
         <Link
          href="/portal/perfil"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Settings className="h-4 w-4" />
          Meu Perfil
        </Link>
         <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
