
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition, useEffect } from 'react';
import { Loader2, PawPrint } from 'lucide-react';
import Link from 'next/link';

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
import { useRouter } from 'next/navigation';

const profileFormSchema = z.object({
    name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
    email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
    phone: z.string().min(10, { message: "Por favor, insira um número de telefone válido com DDD." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function CompleteProfilePage() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const { tutor, updateTutor, loading: tutorLoading } = useTutor();
    const router = useRouter();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: ''
        },
    });

    useEffect(() => {
        if (tutor) {
            form.reset({
                name: tutor.name || user?.displayName || '',
                email: tutor.email || user?.email || '',
                phone: tutor.phone || '',
            });
        } else if (user) {
            // Fallback para dados do user se o tutor não estiver carregado ainda
             form.reset({
                name: user.displayName || '',
                email: user.email || '',
                phone: '',
            });
        }
    }, [tutor, user, form]);

    const onSubmit = (data: ProfileFormValues) => {
        // GARANTIA: Verificamos se o usuário do contexto existe
        if (!user) {
            console.error("Tentativa de salvar perfil sem usuário logado!");
            toast({ variant: "destructive", title: "Erro", description: "Usuário não encontrado. Por favor, faça o login novamente." });
            return;
        }

        // A CORREÇÃO: Usamos 'user.uid' diretamente do contexto.
        const userId = user.uid;
        console.log(`[CLIENT] CONFIRMADO: Enviando atualização para o userId CORRETO: ${userId}`);

        startTransition(async () => {
            const result = await updateUserProfile(userId, data);
            
            if(result.success) {
                updateTutor(data); // Atualiza o contexto localmente para feedback instantâneo
                toast({
                    title: "Perfil Atualizado!",
                    description: "Seu perfil foi completado com sucesso.",
                });
                // A lógica de redirecionamento no AuthContext cuidará do resto
            } else {
                 toast({
                    variant: 'destructive',
                    title: "Erro ao atualizar",
                    description: result.error || "Ocorreu um erro desconhecido.",
                });
            }
        });
    };

    if (authLoading || tutorLoading) {
       return (
         <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando seu perfil...</p>
        </div>
       )
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <div className="w-full max-w-md">
             <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                <PawPrint className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary font-headline">VetCare+</span>
            </Link>
            <Card>
                <CardHeader className="text-center">
                <CardTitle className="font-headline">Quase lá!</CardTitle>
                <CardDescription>
                    Precisamos de mais algumas informações para completar seu perfil.
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
                                    <Input type="email" {...field} disabled={true} />
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
                                <FormLabel>Telefone / WhatsApp</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="(11) 98765-4321" {...field} disabled={isPending} autoFocus />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isPending || tutorLoading} className="w-full">
                                {(isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar e Continuar
                            </Button>
                        </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
