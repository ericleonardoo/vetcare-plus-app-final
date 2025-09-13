
'use client';

import {
  Menu,
  PawPrint,
  Home,
  Calendar,
  Heart,
  ClipboardList,
  Wallet,
  Settings,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentsContext';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useTutor } from '@/context/TutorContext';
import { Input } from '../ui/input';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const { tutor } = useTutor();
  const { appointments } = useAppointments();
  const pathname = usePathname();

  const upcomingAppointmentsCount = useMemo(
    () =>
      appointments.filter(
        (apt) => new Date(apt.date) >= new Date() && apt.tutorId === user?.uid
      ).length,
    [appointments, user]
  );

  const navLinks = [
    { href: '/portal/dashboard', icon: Home, label: 'Dashboard' },
    {
      href: '/portal/agendamentos',
      icon: Calendar,
      label: 'Agendamentos',
      badge:
        upcomingAppointmentsCount > 0 ? upcomingAppointmentsCount : undefined,
    },
    { href: '/portal/pets', icon: Heart, label: 'Meus Pets' },
    {
      href: '/portal/historico',
      icon: ClipboardList,
      label: 'Histórico de Saúde',
    },
    { href: '/portal/financeiro', icon: Wallet, label: 'Financeiro' },
  ];

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle>
              <Link
                href="/portal/dashboard"
                className="flex items-center gap-2 font-semibold"
              >
                <PawPrint className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold text-foreground font-headline">
                  VetCare+
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="grid gap-2 text-lg font-medium p-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'text-primary bg-muted'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-4">
            <Separator className="mb-4" />
             <Link
                href="/portal/perfil"
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === "/portal/perfil" && 'text-primary bg-muted'
                )}
                >
                <Settings className="h-5 w-5" />
                Meu Perfil
            </Link>
            <Button
                variant="ghost"
                onClick={logout}
                className="flex w-full justify-start items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                <LogOut className="h-5 w-5" />
                Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">{tutor?.name}</span>
         <Avatar className="h-8 w-8">
            <AvatarFallback>{tutor?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
