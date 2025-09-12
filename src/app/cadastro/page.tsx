import Link from 'next/link';
import { PawPrint } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CadastroPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
       <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary font-headline">VetCare+</span>
        </Link>
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold font-headline">Crie sua Conta</CardTitle>
            <CardDescription>
              Faça parte da família VetCare+ e gerencie a saúde do seu pet com facilidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" placeholder="Maria da Silva" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="(11) 98765-4321" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button type="submit" className="w-full">
              Criar Conta
            </Button>
          </CardContent>
           <div className="mt-4 text-center text-sm p-6 pt-0">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline">
              Entrar
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
