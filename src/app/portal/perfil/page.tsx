import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock data
const tutor = {
  name: 'Maria Silva',
  email: 'maria.silva@exemplo.com',
  phone: '(11) 98765-4321',
};

export default function ProfilePage() {
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
          <form className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" defaultValue={tutor.name} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={tutor.email} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" defaultValue={tutor.phone} />
            </div>
            <div className="border-t pt-6">
                 <h3 className="text-lg font-medium">Alterar Senha</h3>
                 <p className="text-sm text-muted-foreground mb-4">Deixe os campos em branco para não alterar a senha atual.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input id="new-password" type="password" />
                    </div>
                 </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
