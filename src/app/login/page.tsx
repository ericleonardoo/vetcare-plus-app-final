
'use client';

import Link from 'next/link';
import { PawPrint, LogIn, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Login bem-sucedido!",
        description: "Redirecionando para o seu portal...",
      });
      // A lógica de redirecionamento agora é tratada pelo AuthContext
    } catch (error: any) {
      console.error("Erro no login:", error);
      let errorMessage = "Ocorreu um erro ao fazer login. Tente novamente.";
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = "E-mail ou senha inválidos.";
            break;
          case 'auth/invalid-email':
            errorMessage = "O formato do e-mail é inválido.";
            break;
          case 'auth/too-many-requests':
             errorMessage = "Acesso temporariamente bloqueado devido a muitas tentativas. Tente novamente mais tarde.";
             break;
          default:
             errorMessage = `Ocorreu um erro inesperado. Código: ${error.code}`;
             break;
        }
      }
      toast({
        variant: 'destructive',
        title: "Erro no Login",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
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
                        <Input type="email" placeholder="seu@email.com" {...field} disabled={isLoading} />
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
                        <Input type="password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-end">
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                        Esqueceu sua senha?
                    </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                   Entrar
                </Button>
              </form>
            </Form>
          </CardContent>
          <div className="text-center text-sm p-6 pt-0 space-y-4">
             <div>
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="underline">
                Cadastre-se
                </Link>
            </div>
            <div className="flex items-center space-x-2">
                <Separator className="flex-1" />
                <span className="px-2 text-xs text-muted-foreground">OU</span>
                <Separator className="flex-1" />
            </div>
            <div className="text-center">
                <Link href="/login" className="underline text-sm font-medium">
                    Acessar como Profissional
                </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
