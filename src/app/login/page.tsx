
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
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-4.82 2.25-3.64 0-6.55-3.05-6.55-6.85s2.91-6.85 6.55-6.85c2.06 0 3.49.83 4.3 1.6l2.43-2.43C18.4 2.1 15.74 1 12.48 1 7.22 1 3.22 4.9 3.22 10s4 9 9.26 9c2.86 0 5.02-1 6.56-2.58 1.6-1.6 2.3-3.9 2.3-6.14 0-.54-.05-1.08-.14-1.6z" />
    </svg>
);


const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const router = useRouter();


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
        await signInWithGoogle();
        // A lógica de redirecionamento agora é tratada pelo AuthContext
        toast({
            title: "Login bem-sucedido!",
            description: "Aguarde, estamos te redirecionando...",
        });
    } catch (error) {
        console.error("Erro no login com Google:", error);
        toast({
            variant: "destructive",
            title: "Erro no Login com Google",
            description: "Não foi possível fazer login com o Google. Tente novamente.",
        });
    } finally {
        setIsGoogleLoading(false);
    }
  };


  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      // A lógica de redirecionamento é tratada pelo onAuthStateChanged e pelo AuthGuard
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
                        <Input type="email" placeholder="seu@email.com" {...field} disabled={isLoading || isGoogleLoading} />
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
                        <Input type="password" {...field} disabled={isLoading || isGoogleLoading} />
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
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                   Entrar
                </Button>
              </form>
            </Form>
            <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">OU</span>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                Continuar com Google
            </Button>
          </CardContent>
          <div className="text-center text-sm p-6 pt-0 space-y-4">
             <div>
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="underline">
                Cadastre-se
                </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
