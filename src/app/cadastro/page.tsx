
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


const signupSchema = z.object({
  name: z.string().min(2, { message: "O nome é obrigatório." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  phone: z.string().min(10, { message: "O telefone é obrigatório." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
  isProfessional: z.boolean().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function CadastroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      isProfessional: false,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    // Hack temporário para diferenciar profissionais
    const finalEmail = data.isProfessional ? data.email.replace('@', '+vet@') : data.email;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, data.password);
      const user = userCredential.user;

      // Atualiza o perfil do Firebase Auth com o nome
      await updateProfile(user, { displayName: data.name });

      // Cria o documento do tutor no Firestore
      await setDoc(doc(db, "tutors", user.uid), {
        name: data.name,
        email: finalEmail, // Salva o email final (com +vet se for o caso)
        phone: data.phone,
        isProfessional: data.isProfessional, // Salva a role
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
          case 'permission-denied':
             errorMessage = "Permissão negada para criar o perfil. Verifique as regras de segurança do Firestore.";
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
            <CardTitle className="text-2xl font-bold font-headline">Crie sua Conta</CardTitle>
            <CardDescription>
              Faça parte da família VetCare+ e gerencie a saúde do seu pet com facilidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Maria da Silva" {...field} disabled={isLoading} />
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
                        <Input type="email" placeholder="seu@email.com" {...field} disabled={isLoading} />
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
                        <Input type="tel" placeholder="(11) 98765-4321" {...field} disabled={isLoading} />
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
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isProfessional"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                              <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isLoading}
                                  id="isProfessional"
                              />
                          </FormControl>
                          <Label htmlFor="isProfessional" className="cursor-pointer text-sm font-normal">
                              Cadastrar como profissional (para teste)
                          </Label>
                      </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta
                </Button>
              </form>
            </Form>
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
