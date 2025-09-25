'use client';

import Link from 'next/link';
import { PawPrint, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-4.82 2.25-3.64 0-6.55-3.05-6.55-6.85s2.91-6.85 6.55-6.85c2.06 0 3.49.83 4.3 1.6l2.43-2.43C18.4 2.1 15.74 1 12.48 1 7.22 1 3.22 4.9 3.22 10s4 9 9.26 9c2.86 0 5.02-1 6.56-2.58 1.6-1.6 2.3-3.9 2.3-6.14 0-.54-.05-1.08-.14-1.6z" />
    </svg>
);

const emailRegex = /\S+@\S+\.\S+/;

const signupSchema = z.object({
  name: z.string().min(2, { message: "O nome é obrigatório." }),
  email: z.string().regex(emailRegex, { message: "Por favor, insira um e-mail válido." }),
  phone: z.string().min(10, { message: "O telefone é obrigatório." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function CustomerSignupPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleGoogleSignUp = async () => {
      setIsGoogleLoading(true);
      try {
          await signInWithGoogle('customer');
          // A lógica de redirecionamento agora é tratada pelo AuthContext
          toast({
              title: "Autenticação com Google bem-sucedida!",
              description: "Finalize seu cadastro ou aguarde o redirecionamento.",
          });
      } catch (error: any) {
          let errorMessage = "Não foi possível se cadastrar com o Google. Tente novamente.";
          if (error.code === 'auth/account-exists-with-different-credential') {
              errorMessage = "Já existe uma conta com este e-mail. Tente fazer login.";
          }
          console.error("Erro no cadastro com Google:", error);
          toast({
              variant: "destructive",
              title: "Erro no Cadastro com Google",
              description: errorMessage,
          });
      } finally {
          setIsGoogleLoading(false);
      }
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.name });

      await setDoc(doc(db, "tutors", user.uid), {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'customer',
        profileCompleted: true,
      });

      toast({
        title: "Conta Criada com Sucesso!",
        description: "Você será redirecionado para o seu portal.",
      });
      // O AuthContext cuidará do redirecionamento
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      let errorMessage = "Ocorreu um erro ao criar a conta. Tente novamente.";
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "Este endereço de e-mail já está em uso.";
            break;
          case 'auth/invalid-email':
            errorMessage = "O formato do e-mail é inválido.";
            break;
          case 'auth/weak-password':
            errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
            break;
          default:
            errorMessage = `Ocorreu um erro inesperado. Código: ${error.code}`;
            break;
        }
      }
      toast({
        variant: 'destructive',
        title: "Erro no Cadastro",
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
            <CardTitle className="text-2xl font-bold font-headline">Crie sua Conta de Cliente</CardTitle>
            <CardDescription>
              Faça parte da família VetCare+ e gerencie a saúde do seu pet com facilidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Maria da Silva" {...field} disabled={isLoading || isGoogleLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(11) 98765-4321" {...field} disabled={isLoading || isGoogleLoading} />
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
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} disabled={isLoading || isGoogleLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full !mt-6" disabled={isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta
                </Button>
              </form>
            </Form>
            <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">OU</span>
            </div>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading || isGoogleLoading}>
                {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                Cadastrar com Google
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
