'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/actions';
import { useTutor } from '@/context/TutorContext';
import { useAuth } from '@/context/AuthContext';

const profileFormSchema = z.object({
    name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
    email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
    phone: z.string().min(10, { message: "Por favor, insira um número de telefone válido." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const { user } = useAuth();
    const { tutor, updateTutor, loading: isTutorLoading } = useTutor();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: ''
        },
    });

    useEffect(() => {
        // Redefine o formulário apenas quando os dados do tutor forem carregados
        if (tutor) {
            form.reset({
                name: tutor.name || '',
                email: tutor.email || '',
                phone: tutor.phone || '',
            });
        }
    }, [tutor, form]);

    const onSubmit = (data: ProfileFormValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: "Erro", description: "Você precisa estar logado."});
            return;
        }

        startTransition(async () => {
            const result = await updateUserProfile(user.uid, data);
            if(result.success) {
                updateTutor(data); // Atualiza o contexto localmente para feedback instantâneo
                toast({
                    title: "Sucesso!",
                    description: result.message,
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: "Erro",
                    description: result.error,
                });
            }
        });
    };

    if (isTutorLoading) {
       return (
         <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
       )
    }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações de contato e preferências.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Mantenha seus dados sempre atualizados para facilitar nosso contato.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                            <Input {...field} disabled={isPending} />
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
                            <Input type="email" {...field} disabled={isPending || !!user?.email} />
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
                            <Input type="tel" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium">Alterar Senha</h3>
                    <p className="text-sm text-muted-foreground mb-4">Deixe os campos em branco para não alterar a senha atual.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <FormLabel htmlFor="current-password">Senha Atual</FormLabel>
                            <Input id="current-password" type="password" disabled={true} />
                        </div>
                        <div className="grid gap-2">
                            <FormLabel htmlFor="new-password">Nova Senha</FormLabel>
                            <Input id="new-password" type="password" disabled={true} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isPending || isTutorLoading}>
                         {(isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
