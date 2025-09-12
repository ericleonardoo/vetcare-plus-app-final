import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const pets = [
  {
    id: 1,
    name: 'Paçoca',
    species: 'Cachorro',
    breed: 'Vira-lata Caramelo',
    age: '3 anos',
    avatarUrl: 'https://picsum.photos/seed/brasil1/200/200',
    avatarHint: 'dog brazil',
  },
  {
    id: 2,
    name: 'Whiskers',
    species: 'Gato',
    breed: 'Siamês',
    age: '5 anos',
    avatarUrl: 'https://picsum.photos/seed/pet2/200/200',
    avatarHint: 'siamese cat',
  },
];

export default function PetsPage() {
  return (
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
                <img
                  src={pet.avatarUrl}
                  alt={pet.name}
                  className="w-full h-48 object-cover"
                  data-ai-hint={pet.avatarHint}
                />
              </Link>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/70 hover:bg-background">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
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
  );
}
