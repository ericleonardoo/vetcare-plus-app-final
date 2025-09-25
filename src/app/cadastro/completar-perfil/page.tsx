'use client';

import { useEffect, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { PawPrint, Loader2 } from 'lucide-react';
import { updateUserProfileOnClient } from '@/lib/tutor';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Componentes da sua UI
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const profileSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  phone: z.string().min(10, { message: 'O telefone deve ter pelo menos 10 dígitos.' }).regex(/^\+?[\d\s-()]{10,15}$/, { message: 'Telefone inválido.' }),
});
type ProfileSchemaType = z.infer<typeof profileSchema>;

export default function CompletarPerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: user?.displayName || '',
        phone: user?.phoneNumber || '',
    },
  });

  useEffect(() => {
    if (user) {
        form.reset({
            name: user.displayName || '',
            phone: user.phoneNumber || '',
        });
    }
  }, [user, form]);


  const handleProfileUpdate = (data: ProfileSchemaType) => {
    if (!user) {
      console.error("Tentativa de salvar perfil sem um usuário válido no contexto!");
      toast({
        variant: "destructive",
        title: "Erro Crítico",
        description: "Usuário não autenticado. Por favor, faça o login novamente.",
      });
      return;
    }
    
    startTransition(async () => {
      try {
        await updateUserProfileOnClient(user.uid, data);
        toast({
          title: "Sucesso!",
          description: "Seu perfil foi salvo. Redirecionando...",
        });
        router.push('/portal/dashboard');
      } catch (error) {
        console.error("Erro ao atualizar perfil no cliente:", error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar",
          description: "Não foi possível salvar suas informações. Verifique suas Regras do Firestore.",
        });
      }
    });
  };

  if (authLoading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
    );
  }
  
  if (!user) {
      router.push('/login');
      return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center space-y-4">
            <Link href="/" className="flex items-center justify-center gap-2">
                <PawPrint className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary font-headline">VetCare+</span>
            </Link>
          <CardTitle className="text-2xl font-headline">Quase lá!</CardTitle>
          <CardDescription>
            Confirme seus dados e adicione um telefone para completar seu perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="grid gap-4">
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                              <Input type="text" {...field} />
                          </FormControl>
                           <FormMessage />
                      </FormItem>
                  )}
              />
              <div className="grid gap-2">
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value={user.email || ''} disabled />
              </div>
              <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Telefone / WhatsApp</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(XX) XXXXX-XXXX" {...field} autoFocus disabled={isPending} />
                          </FormControl>
                           <FormMessage />
                      </FormItem>
                  )}
              />
              <Button type="submit" className="w-full mt-4" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar e Continuar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
