import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground font-headline">VetCare+</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="hidden md:flex items-center space-x-2">
                <Button variant="link" asChild><Link href="#servicos">Serviços</Link></Button>
                <Button variant="link" asChild><Link href="#equipe">Equipe</Link></Button>
                <Button variant="link" asChild><Link href="#depoimentos">Depoimentos</Link></Button>
                <Button variant="link" asChild><Link href="#faq">FAQ</Link></Button>
                <Button variant="link" asChild><Link href="#contato">Contato</Link></Button>
            </nav>
            <Button asChild>
              <Link href="#agendamento">Agende Agora</Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
