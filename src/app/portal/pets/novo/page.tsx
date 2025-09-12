import Link from 'next/link';
import { ArrowLeft, Camera } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function NewPetPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Meus Pets
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="font-headline">Adicionar um Novo Pet</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para cadastrar seu novo companheiro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-secondary">
                 <Camera className="w-12 h-12 text-muted-foreground" />
                 <Input type="file" className="hidden" id="pet-avatar" />
              </div>
              <Label htmlFor='pet-avatar' className='cursor-pointer text-sm text-primary underline'>Adicionar Foto</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pet-name">Nome do Pet</Label>
                <Input id="pet-name" placeholder="Paçoca" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="species">Espécie</Label>
                <Select>
                  <SelectTrigger id="species">
                    <SelectValue placeholder="Selecione a espécie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Cachorro</SelectItem>
                    <SelectItem value="cat">Gato</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="breed">Raça</Label>
                <Input id="breed" placeholder="Vira-lata Caramelo" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="birthdate">Data de Nascimento</Label>
                <Input id="birthdate" type="date" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gênero</Label>
               <Select>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Macho</SelectItem>
                    <SelectItem value="female">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="notes">Notas Adicionais</Label>
                <Textarea id="notes" placeholder="Alergias, comportamentos, etc." />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" asChild><Link href="/portal/pets">Cancelar</Link></Button>
                <Button type="submit">Salvar Pet</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
