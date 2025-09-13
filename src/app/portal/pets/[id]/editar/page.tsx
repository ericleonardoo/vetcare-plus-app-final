'use client';

import Link from 'next/link';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
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
import { useEffect, useTransition } from 'react';
import { Label } from '@/components/ui/label';

const petFormSchema = z.object({
  name: z.string().min(2, { message: "O nome é obrigatório." }),
  species: z.string({ required_error: "Selecione a espécie." }),
  breed: z.string().min(2, { message: "A raça é obrigatória." }),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data inválida." }),
  gender: z.string({ required_error: "Selecione o gênero." }),
  notes: z.string().optional(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

export default function EditPetPage({ params }: { params: { id: string } }) {
  const { pets, updatePet, loading } = usePets();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const pet = pets.find((p) => p.id === params.id);

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
  });

  useEffect(() => {
    if (pet) {
      form.reset({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate,
        gender: pet.gender,
        notes: pet.healthHistory.find(h => h.type === 'Consulta' && h.details.startsWith('Notas:'))?.details.substring(7) || '',
      });
    }
  }, [pet, form]);

  function onSubmit(data: PetFormValues) {
    if (!pet) return;

    startTransition(async () => {
        try {
            await updatePet(pet.id, data);
            toast({
              title: "Pet Atualizado!",
              description: `Os dados de ${data.name} foram atualizados com sucesso.`,
            });
            router.push('/portal/pets');
        } catch(error) {
            console.error("Erro ao atualizar pet:", error);
            toast({
                variant: 'destructive',
                title: "Erro",
                description: "Não foi possível atualizar o pet. Tente novamente."
            });
        }
    });
  }

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando dados do pet...</p>
        </div>
    );
  }

  if (!pet) {
     return (
        <div className='text-center'>
            <p className='text-lg font-semibold'>Pet não encontrado</p>
            <p className='text-muted-foreground'>Não foi possível encontrar os dados deste pet.</p>
             <Button variant="outline" size="sm" asChild className='mt-4'>
                <Link href="/portal/pets">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Meus Pets
                </Link>
            </Button>
        </div>
    )
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
          <CardTitle className="font-headline">Editar Dados de {pet.name}</CardTitle>
          <CardDescription>
            Atualize as informações do seu companheiro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-secondary">
                  <img src={pet.avatarUrl} alt={pet.name} className="w-32 h-32 rounded-full object-cover"/>
                  <Input type="file" className="hidden" id="pet-avatar" />
                </div>
                <Label htmlFor='pet-avatar' className='cursor-pointer text-sm text-primary underline'>Alterar Foto</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Pet</FormLabel>
                      <FormControl>
                        <Input placeholder="Paçoca" {...field} disabled={isPending} />
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
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
                        <Input placeholder="Vira-lata Caramelo" {...field} disabled={isPending}/>
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
                        <Input type="date" {...field} disabled={isPending}/>
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
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
                        <Textarea id="notes" placeholder="Alergias, comportamentos, etc." {...field} disabled={isPending}/>
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" asChild>
                  <Link href="/portal/pets">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
