'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint } from 'lucide-react';

export function SchedulingCta() {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <PawPrint className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-bold mt-4">Pronto para Cuidar do seu Pet?</CardTitle>
        <CardDescription>
          Acesse nosso portal ou crie sua conta para agendar uma consulta com nossos especialistas. É rápido e fácil!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button asChild variant="outline">
            <Link href="/login">Já tenho uma conta</Link>
          </Button>
          <Button asChild>
            <Link href="/cadastro/cliente">Criar minha conta</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
