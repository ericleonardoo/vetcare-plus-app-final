
'use client';

import Link from 'next/link';
import { PawPrint, User, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ChooseProfilePage() {
  const router = useRouter();

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
              Escolha seu tipo de perfil para começar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Button variant="outline" size="lg" className="h-20 text-lg" onClick={() => router.push('/cadastro/cliente')}>
              <User className="mr-4 h-6 w-6" />
              Sou Tutor de Pet
            </Button>
            <Button variant="outline" size="lg" className="h-20 text-lg" onClick={() => router.push('/cadastro/profissional')}>
              <Stethoscope className="mr-4 h-6 w-6" />
              Sou Profissional
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
