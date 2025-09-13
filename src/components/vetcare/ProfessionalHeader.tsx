
'use client';

import {
  Menu,
  PawPrint,
  Home,
  Calendar,
  Users,
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
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfessionalHeader() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const vetImage = PlaceHolderImages.find((img) => img.id === 'vet-1');

  const navLinks = [
    { href: '/professional/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/professional/agenda', icon: Calendar, label: 'Agenda' },
    { href: '/professional/pacientes', icon: Users, label: 'Pacientes' },
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
           <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
             <Link
                href="/professional/dashboard"
                className="flex items-center gap-2 font-semibold"
              >
                <PawPrint className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold text-foreground font-headline">
                  VetCare+ Pro
                </span>
              </Link>
           </div>
          <nav className="grid gap-2 text-lg font-medium p-4">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
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
                href="/professional/perfil"
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname.startsWith('/professional/perfil') && 'text-primary bg-muted'
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
         <Button variant="outline" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificações</span>
        </Button>
        <Avatar className="h-8 w-8">
            {vetImage && <AvatarImage src={vetImage.imageUrl} />}
            <AvatarFallback>EC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
