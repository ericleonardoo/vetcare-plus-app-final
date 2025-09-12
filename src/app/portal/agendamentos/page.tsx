
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, ListFilter, File } from 'lucide-react';
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

// Mock data
const pets = [
  {
    id: 1,
    name: 'Paçoca',
    avatarUrl: 'https://picsum.photos/seed/brasil1/200/200',
  },
  {
    id: 2,
    name: 'Whiskers',
    avatarUrl: 'https://picsum.photos/seed/pet2/200/200',
  },
];

const appointments = [
    { id: 1, petName: 'Paçoca', service: 'Check-up de Rotina', date: '2024-08-15T10:00:00', status: 'Confirmado' as const, vet: 'Dra. Emily Carter' },
    { id: 2, petName: 'Whiskers', service: 'Vacinação Anual', date: '2024-08-22T14:30:00', status: 'Confirmado' as const, vet: 'Dr. Ben Jacobs' },
    { id: 3, petName: 'Paçoca', service: 'Limpeza Dental', date: '2024-07-20T11:00:00', status: 'Realizado' as const, vet: 'Dra. Emily Carter' },
    { id: 4, petName: 'Whiskers', service: 'Consulta de Emergência', date: '2024-06-05T16:20:00', status: 'Realizado' as const, vet: 'Dr. Ben Jacobs' },
    { id: 5, petName: 'Paçoca', service: 'Consulta para Cirurgia', date: '2024-09-02T09:00:00', status: 'Agendado' as const, vet: 'Dr. Ben Jacobs' },
]

const upcomingAppointments = appointments.filter(apt => apt.status !== 'Realizado');
const pastAppointments = appointments.filter(apt => apt.status === 'Realizado');

export default function AppointmentsPage() {
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

  const renderAppointmentsTable = (apts: typeof appointments) => (
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
                 const pet = pets.find(p => p.name === apt.petName);
                 return (
                    <TableRow key={apt.id}>
                        <TableCell className="hidden sm:table-cell">
                            <div className='flex items-center gap-2'>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={pet?.avatarUrl} />
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
                <TabsContent value="proximos">
                    {renderAppointmentsTable(upcomingAppointments)}
                </TabsContent>
                <TabsContent value="passados">
                    {renderAppointmentsTable(pastAppointments)}
                </TabsContent>
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
