import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
        <nav className="hidden md:flex flex-1 items-center justify-start space-x-2">
            <Button variant="link" asChild><Link href="/#servicos">Serviços</Link></Button>
            <Button variant="link" asChild><Link href="/#equipe">Equipe</Link></Button>
            <Button variant="link" asChild><Link href="/#depoimentos">Depoimentos</Link></Button>
            <Button variant="link" asChild><Link href="/#faq">FAQ</Link></Button>
            <Button variant="link" asChild><Link href="/#contato">Contato</Link></Button>
        </nav>
        <div className="flex items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button asChild>
              <Link href="/cadastro">Cadastre-se</Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
