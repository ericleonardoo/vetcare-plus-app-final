'use client';

import { usePets } from "@/context/PetsContext";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Bone, Cat, Dog, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTutors } from "@/context/TutorsContext";
import { Skeleton } from "@/components/ui/skeleton";


export default function ProfessionalPatientsPage() {
  const { pets, loading: petsLoading } = usePets();
  const { tutors, loading: tutorsLoading } = useTutors();

  const getPetIcon = (species: string) => {
    switch (species) {
        case 'Cachorro': return Dog;
        case 'Gato': return Cat;
        default: return Bone;
    }
  }

  const isLoading = petsLoading || tutorsLoading;

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-32" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-32" /></TableHead>
          <TableHead><Skeleton className="h-4 w-32" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Users className="w-8 h-8" />
                Gerenciamento de Pacientes
            </h1>
            <p className="text-muted-foreground">
                Busque, visualize e gerencie os prontuários de todos os pacientes.
            </p>
        </div>
        <Button asChild>
          <Link href="/portal/pets/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Novo Paciente
          </Link>
        </Button>
      </header>
       <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Todos os Pacientes</CardTitle>
            <CardDescription>
             {!isLoading ? `Total de ${pets.length} pacientes cadastrados na clínica.` : <Skeleton className="h-4 w-48" />}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : pets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Raça</TableHead>
                  <TableHead>Tutor(a)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {pets.map((pet) => {
                    const Icon = getPetIcon(pet.species);
                    const tutor = tutors.find(t => t.id === pet.tutorId);
                    return (
                      <TableRow key={pet.id}>
                         <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                  <AvatarImage src={pet.avatarUrl} alt={pet.name} />
                                  <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{pet.name}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              {pet.species}
                          </div>
                        </TableCell>
                         <TableCell>{pet.breed}</TableCell>
                         <TableCell>{tutor?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="outline" size="sm">
                              <Link href={`/professional/pacientes/${pet.id}`}>Ver Prontuário</Link>
                           </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Sua base de pacientes está vazia</h3>
              <p className="mt-2 text-sm text-muted-foreground">Comece adicionando seu primeiro paciente para construir o histórico da clínica.</p>
              <Button className="mt-6" asChild>
                <Link href="/portal/pets/novo">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar primeiro paciente
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
