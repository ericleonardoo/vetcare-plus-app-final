
'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  Users,
  Calendar,
  LogOut,
  PawPrint,
  Settings,
  Search,
  Wallet,
  Package,
  LineChart,
  ClipboardUser,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '../ui/input';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
    { href: "/professional/dashboard", icon: Home, label: "Dashboard" },
    { href: "/professional/agenda", icon: Calendar, label: "Agenda" },
    { href: "/professional/pacientes", icon: Users, label: "Pacientes" },
    { href: "/professional/equipe", icon: ClipboardUser, label: "Equipe" },
    { href: "/professional/financeiro", icon: Wallet, label: "Financeiro" },
    { href: "/professional/estoque", icon: Package, label: "Estoque" },
    { href: "/professional/relatorios", icon: LineChart, label: "Relatórios" },
]

export default function ProfessionalSidebar() {
    const pathname = usePathname();
    const vetImage = PlaceHolderImages.find((img) => img.id === 'vet-1');
    const { logout } = useAuth();

  return (
    <aside className="hidden w-72 flex-col border-r bg-background p-4 md:flex">
      <div className="flex h-16 items-center gap-2 px-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <PawPrint className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground font-headline">VetCare+ Pro</span>
        </Link>
         <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Alternar notificações</span>
        </Button>
      </div>
      <div className='p-2'>
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar paciente..."
              className="w-full rounded-lg bg-muted pl-8"
            />
        </div>
      </div>
      
      <nav className="flex flex-col gap-2 p-2 text-sm font-medium">
        {navLinks.map(link => {
            const isActive = pathname.startsWith(link.href);
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
                </Link>
            )
        })}
      </nav>
      <div className="mt-auto p-2">
        <Separator className='my-2' />
         <Link
            href="/professional/perfil"
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                pathname.startsWith('/professional/perfil') && "bg-muted text-primary"
            )}
            >
            <Settings className="h-4 w-4" />
            Meu Perfil
         </Link>
         <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground">
          <Avatar className='w-9 h-9'>
            {vetImage && <AvatarImage src={vetImage.imageUrl} />}
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>Dra. Emily Carter</span>
            <span className='text-xs'>Veterinária Chefe</span>
          </div>
        </div>
         <Button
          variant="ghost"
          onClick={logout}
          className="flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
