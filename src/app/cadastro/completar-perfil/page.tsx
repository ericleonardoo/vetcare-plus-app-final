'use client';

import { useEffect, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { PawPrint, Loader2 } from 'lucide-react';
import { updateUserProfileOnClient } from '@/lib/tutor';
import InputMask from 'react-input-mask';


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
import { Label } from "@/components/ui/label"

export default function CompletarPerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // ESTE LOG É O MAIS IMPORTANTE DE TODOS.
  // Ele vai nos dizer QUEM a página acha que está logado.
  useEffect(() => {
    console.log("====== VERIFICAÇÃO DA PÁGINA 'COMPLETAR-PERFIL' ======");
    if (authLoading) {
      console.log("Auth Context ainda está carregando...");
    } else {
      console.log("Auth Context carregado. Usuário detectado NESTA PÁGINA:", user);
    }
    console.log("======================================================");
  }, [user, authLoading]);


  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Garantia MÁXIMA de que o usuário existe antes de continuar
    if (!user) {
      console.error("Tentativa de salvar perfil sem um usuário válido no contexto!");
      toast({
        variant: "destructive",
        title: "Erro Crítico",
        description: "Usuário não autenticado. Por favor, faça o login novamente.",
      });
      return;
    }
    
    const formData = new FormData(event.currentTarget);
    const phone = formData.get('phone') as string;
    const name = formData.get('name') as string;
    
    // A única fonte da verdade para o ID do usuário
    const userId = user.uid;

    console.log(`[CLIENT] PREPARANDO PARA CHAMAR A ACTION. Fonte da Verdade (user.uid): ${userId}`);
    startTransition(async () => {
      try {
        // CHAMA A NOVA FUNÇÃO DO LADO DO CLIENTE
        await updateUserProfileOnClient(userId, { name, phone });

        toast({
          title: "Sucesso!",
          description: "Seu perfil foi salvo. Redirecionando...",
        });

        // A lógica de redirecionamento do AuthGuard vai te tirar daqui
        // Mas podemos forçar para uma melhor UX
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
  
  // Se, após carregar, não tiver usuário, redireciona.
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
          <form onSubmit={handleProfileUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" type="text" defaultValue={user.displayName || ''} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <InputMask
                mask="(99) 99999-9999"
                defaultValue={user.phoneNumber || ''}
                name="phone"
                disabled={isPending}
              >
                {(inputProps: any) => <Input {...inputProps} type="tel" placeholder="(XX) XXXXX-XXXX" required autoFocus />}
              </InputMask>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar e Continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
