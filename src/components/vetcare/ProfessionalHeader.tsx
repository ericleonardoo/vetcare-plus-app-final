
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
  Wallet,
  Package,
  LineChart,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';

export default function ProfessionalHeader() {
  const { logout, userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const vetImage = PlaceHolderImages.find((img) => img.id === 'vet-1');

  const navLinks = [
    { href: '/professional/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/professional/agenda', icon: Calendar, label: 'Agenda' },
    { href: '/professional/pacientes', icon: Users, label: 'Pacientes' },
    { href: '/professional/equipe', icon: ClipboardList, label: 'Equipe' },
    { href: '/professional/financeiro', icon: Wallet, label: 'Financeiro' },
    { href: '/professional/estoque', icon: Package, label: 'Estoque' },
    { href: '/professional/relatorios', icon: LineChart, label: 'Relatórios' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 sm:max-w-xs">
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
            <Separator className="my-4" />
             <DropdownMenu onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                        <Avatar className="h-9 w-9">
                            {vetImage && <AvatarImage src={vetImage.imageUrl} />}
                            <AvatarFallback>{userProfile?.name?.charAt(0) ?? 'V'}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="text-sm font-medium">{userProfile?.name}</p>
                            <p className="text-xs text-muted-foreground">{userProfile?.role === 'professional' ? 'Profissional' : ''}</p>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/professional/perfil">Perfil</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="#">Suporte</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">Sair</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]"
            />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar className='h-8 w-8'>
                {vetImage && <AvatarImage src={vetImage.imageUrl} />}
                <AvatarFallback>{userProfile?.name?.charAt(0) ?? 'V'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpen(true)} asChild><Link href="/professional/perfil">Perfil</Link></DropdownMenuItem>
          <DropdownMenuItem>Suporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
