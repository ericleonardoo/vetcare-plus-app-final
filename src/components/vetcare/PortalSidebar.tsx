
'use client';

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
import { useAppointments } from '@/context/AppointmentsContext';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export default function PortalSidebar() {
  const { user, logout } = useAuth();
  const { appointments } = useAppointments();
   const pathname = usePathname();

  const upcomingAppointmentsCount = useMemo(() => 
    appointments.filter(apt => new Date(apt.date) >= new Date() && apt.tutorId === user?.uid).length,
    [appointments, user]
  );

  const navLinks = [
    { href: "/portal/dashboard", icon: Home, label: "Dashboard" },
    { href: "/portal/agendamentos", icon: Calendar, label: "Agendamentos", badge: upcomingAppointmentsCount > 0 ? upcomingAppointmentsCount : undefined },
    { href: "/portal/pets", icon: Heart, label: "Meus Pets" },
    { href: "/portal/historico", icon: ClipboardList, label: "Histórico de Saúde" },
    { href: "/portal/financeiro", icon: Wallet, label: "Minhas Faturas" },
  ]

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
        {navLinks.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                isActive && "bg-muted text-primary"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              {link.badge && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {link.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <Separator className='mb-2' />
         <Link
          href="/portal/perfil"
          className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted", pathname === "/portal/perfil" && "bg-muted text-primary")}
        >
          <Settings className="h-4 w-4" />
          Meu Perfil
        </Link>
         <Button
          variant="ghost"
          onClick={logout}
          className="flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
