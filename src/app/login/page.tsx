
'use client';

import Link from 'next/link';
import { PawPrint, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
  isProfessional: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      isProfessional: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    // Em um app real, aqui você faria a chamada para a sua API de autenticação.
    console.log("Dados do login:", data);
    
    // Simulação de lógicas de redirecionamento diferentes.
    if (data.email === 'vet@vetcare.com' || data.isProfessional) {
        // Redireciona para o painel profissional se for um email específico ou se o checkbox estiver marcado
        router.push('/professional/dashboard');
    } else {
        // Redireciona para o portal do cliente para todos os outros usuários
        router.push('/portal/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary font-headline">VetCare+</span>
        </Link>
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold font-headline">Acesse seu Portal</CardTitle>
            <CardDescription>
              Bem-vindo de volta! Insira seus dados para acessar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                     <FormField
                        control={form.control}
                        name="isProfessional"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <Label htmlFor="isProfessional" className="cursor-pointer">
                                        Acessar como profissional
                                    </Label>
                                </div>
                            </FormItem>
                        )}
                    />
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                        Esqueceu sua senha?
                    </Link>
                </div>
                <Button type="submit" className="w-full">
                  <LogIn className="mr-2 h-4 w-4" /> Entrar
                </Button>
              </form>
            </Form>
          </CardContent>
          <div className="mt-4 text-center text-sm p-6 pt-0">
            Não tem uma conta de cliente?{' '}
            <Link href="/cadastro" className="underline">
              Cadastre-se
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
