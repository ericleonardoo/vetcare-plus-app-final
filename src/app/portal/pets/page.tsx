'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, MoreVertical, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { usePets } from '@/context/PetsContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Pet } from '@/context/PetsContext';


export default function PetsPage() {
    const { pets, deletePet, loading } = usePets();
    const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
      if (!petToDelete) return;

      setIsDeleteLoading(true);
      try {
        await deletePet(petToDelete.id);
        toast({
          title: "Pet Removido",
          description: `${petToDelete.name} foi removido com sucesso.`
        });
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Erro ao remover pet",
          description: "Não foi possível remover o pet. Tente novamente."
        });
      } finally {
        setIsDeleteLoading(false);
        setPetToDelete(null);
      }
    }

    if (loading) {
        return (
             <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando seus pets...</p>
            </div>
        )
    }

  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Meus Pets</h1>
          <p className="text-muted-foreground">
            Gerencie aqui as informações dos seus companheiros.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/pets/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Novo Pet
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pets.map((pet) => (
          <Card key={pet.id} className="overflow-hidden group">
            <CardHeader className="p-0 relative">
              <Link href={`/portal/pets/${pet.id}`}>
                <div className='w-full h-48 bg-muted'>
                  <img
                    src={pet.avatarUrl}
                    alt={pet.name}
                    className="w-full h-48 object-cover"
                    data-ai-hint={pet.avatarHint}
                  />
                </div>
              </Link>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/70 hover:bg-background">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link href={`/portal/pets/${pet.id}/editar`}>Editar</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/portal/pets/${pet.id}`}>Ver Histórico</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setPetToDelete(pet)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <Link href={`/portal/pets/${pet.id}`} className="block hover:bg-accent">
                <CardContent className="p-4">
                    <h3 className="text-xl font-bold font-headline">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">{pet.species} - {pet.breed}</p>
                    <p className="text-sm text-muted-foreground mt-1">Idade: {pet.age}</p>
                </CardContent>
            </Link>
          </Card>
        ))}
        <Link
          href="/portal/pets/novo"
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[250px]"
        >
          <PlusCircle className="h-10 w-10" />
          <span className="font-semibold">Adicionar Novo Pet</span>
        </Link>
      </div>
    </div>
    <AlertDialog open={!!petToDelete} onOpenChange={(isOpen) => !isOpen && setPetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá remover permanentemente o pet <span className='font-bold'>{petToDelete?.name}</span> e todo o seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleteLoading}>
              {isDeleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sim, remover pet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
