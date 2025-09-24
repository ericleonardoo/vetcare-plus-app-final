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
import { useState, useTransition, useRef } from 'react';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

const petFormSchema = z.object({
  name: z.string().min(2, { message: "O nome é obrigatório." }),
  species: z.string({ required_error: "Selecione a espécie." }),
  breed: z.string().min(2, { message: "A raça é obrigatória." }),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data inválida." }),
  gender: z.string({ required_error: "Selecione o gênero." }),
  notes: z.string().optional(),
  avatarFile: z.instanceof(File).optional(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

export default function NewPetPage() {
  const { addPet } = usePets();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      breed: '',
      notes: '',
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('avatarFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  function onSubmit(data: PetFormValues) {
    startTransition(async () => {
        try {
            await addPet(data);
            toast({
              title: "Pet Adicionado!",
              description: `${data.name} agora faz parte da sua família VetCare+.`,
            });
            router.push('/portal/pets');

        } catch(error) {
            console.error("Erro ao adicionar pet:", error);
            toast({
                variant: 'destructive',
                title: "Erro",
                description: "Não foi possível adicionar o pet. Tente novamente."
            });
        }
    });
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
                 <div
                  className="w-32 h-32 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-secondary relative overflow-hidden"
                  onClick={triggerFileInput}
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Pré-visualização do avatar" layout="fill" objectFit="cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <Input
                  type="file"
                  className="hidden"
                  id="pet-avatar"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png, image/jpeg, image/gif"
                />
                <Button type="button" variant="link" className="text-primary" onClick={triggerFileInput}>
                  Adicionar Foto
                </Button>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
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
                    Salvar Pet
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
