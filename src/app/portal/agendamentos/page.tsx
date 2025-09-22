'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, ListFilter, File, Loader2, CalendarX2 } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import { usePets } from '@/context/PetsContext';
import { useAppointments, Appointment } from '@/context/AppointmentsContext';
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppointmentsPage() {
  const { pets } = usePets();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { user } = useAuth();

  const userAppointments = useMemo(() => {
    if (!user) return [];
    // A busca agora é feita com 'where' no contexto, mas uma filtragem dupla garante.
    return appointments.filter(apt => apt.tutorId === user.uid);
  }, [appointments, user]);

  const upcomingAppointments = useMemo(() => 
    userAppointments
      .filter(apt => new Date(apt.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), 
    [userAppointments]
  );
  
  const pastAppointments = useMemo(() => 
    userAppointments
      .filter(apt => new Date(apt.date) < new Date())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [userAppointments]
  );


  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return 'default';
      case 'Agendado':
        return 'secondary';
      case 'Realizado':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const renderAppointmentsTable = (apts: Appointment[]) => (
     <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="hidden sm:table-cell">Pet</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Data e Horário</TableHead>
            <TableHead className="hidden md:table-cell">Veterinário(a)</TableHead>
            <TableHead className="text-right">Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {apts.map(apt => {
                 const pet = pets.find(p => p.id === apt.petId);
                 return (
                    <TableRow key={apt.id}>
                        <TableCell className="hidden sm:table-cell">
                            <div className='flex items-center gap-2'>
                                <Avatar className="h-8 w-8">
                                    {pet && <AvatarImage src={pet.avatarUrl} />}
                                    <AvatarFallback>{apt.petName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className='font-medium'>{apt.petName}</span>
                            </div>
                        </TableCell>
                        <TableCell>{apt.service}</TableCell>
                        <TableCell>
                            {new Date(apt.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric'})} às {new Date(apt.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{apt.vet}</TableCell>
                        <TableCell className="text-right">
                           <Badge variant={getStatusVariant(apt.status)}>{apt.status}</Badge>
                        </TableCell>
                    </TableRow>
                 )
            })}
        </TableBody>
    </Table>
  );

  const renderTableSkeleton = () => (
     <Table>
        <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32" /></TableHead>
              <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {[...Array(4)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell className="hidden sm:table-cell">
                        <div className='flex items-center gap-2'>
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
  );

  const renderEmptyState = (message: string) => (
     <div className="flex flex-col items-center justify-center text-center p-12">
      <CalendarX2 className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">Nenhum agendamento aqui</h3>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Agendamentos</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie as consultas dos seus pets.
          </p>
        </div>
      </div>
       <Tabs defaultValue="proximos">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="passados">Histórico</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filtrar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Agendado
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>
                  Confirmado
                </DropdownMenuCheckboxItem>
                 <DropdownMenuCheckboxItem>
                  Realizado
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Exportar</span>
            </Button>
             <Button asChild size="sm" className="h-7 gap-1">
                <Link href="/portal/agendamentos/novo">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Nova Consulta</span>
                </Link>
            </Button>
          </div>
        </div>
        <Card>
            <CardContent className='p-0'>
                {appointmentsLoading ? (
                     renderTableSkeleton()
                ) : (
                    <>
                      <TabsContent value="proximos">
                          {upcomingAppointments.length > 0 ? renderAppointmentsTable(upcomingAppointments) : renderEmptyState("Você não tem nenhuma consulta futura marcada.")}
                      </TabsContent>
                      <TabsContent value="passados">
                          {pastAppointments.length > 0 ? renderAppointmentsTable(pastAppointments) : renderEmptyState("Nenhum agendamento passado foi encontrado.")}
                      </TabsContent>
                    </>
                )}
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
