'use client';

import Link from 'next/link';
import { ArrowLeft, Camera } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePets } from '@/context/PetsContext';
import { useToast } from '@/hooks/use-toast';

const petFormSchema = z.object({
  name: z.string().min(2, { message: "O nome é obrigatório." }),
  species: z.string({ required_error: "Selecione a espécie." }),
  breed: z.string().min(2, { message: "A raça é obrigatória." }),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data inválida." }),
  gender: z.string({ required_error: "Selecione o gênero." }),
  notes: z.string().optional(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

export default function NewPetPage() {
  const { addPet } = usePets();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      breed: '',
      notes: '',
    },
  });

  function onSubmit(data: PetFormValues) {
    const newPet = {
      id: Date.now(),
      ...data,
      avatarUrl: `https://picsum.photos/seed/${data.name}/200/200`,
      avatarHint: `${data.species} ${data.breed}`,
      healthHistory: [],
      // Calculando a idade a partir da data de nascimento
      get age() {
        const birthDate = new Date(this.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return `${age} anos`;
      }
    };
    addPet(newPet);
    toast({
      title: "Pet Adicionado!",
      description: `${data.name} agora faz parte da sua família VetCare+.`,
    });
    router.push('/portal/pets');
  }

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-secondary">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <Input type="file" className="hidden" id="pet-avatar" />
                </div>
                <Label htmlFor='pet-avatar' className='cursor-pointer text-sm text-primary underline'>Adicionar Foto</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Pet</FormLabel>
                      <FormControl>
                        <Input placeholder="Paçoca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espécie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a espécie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cachorro">Cachorro</SelectItem>
                          <SelectItem value="Gato">Gato</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raça</FormLabel>
                      <FormControl>
                        <Input placeholder="Vira-lata Caramelo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Macho">Macho</SelectItem>
                          <SelectItem value="Fêmea">Fêmea</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionais</FormLabel>
                      <FormControl>
                        <Textarea id="notes" placeholder="Alergias, comportamentos, etc." {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" asChild>
                  <Link href="/portal/pets">Cancelar</Link>
                </Button>
                <Button type="submit">Salvar Pet</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
