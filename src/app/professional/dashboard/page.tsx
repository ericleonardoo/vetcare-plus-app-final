'use client';

import { useAppointments } from "@/context/AppointmentsContext";
import { useMemo } from "react";
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
import { usePets } from "@/context/PetsContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, PawPrint } from "lucide-react";
import Link from "next/link";


export default function ProfessionalDashboard() {
  const { appointments } = useAppointments();
  const { pets } = usePets();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = useMemo(() => 
    appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0,0,0,0);
        return aptDate.getTime() === today.getTime() && apt.status !== 'Realizado';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [appointments, today]
  );
  
  const stats = useMemo(() => {
    const totalToday = upcomingAppointments.length;
    const completed = appointments.filter(apt => new Date(apt.date).getTime() < new Date().getTime()).length;
    const totalPets = pets.length;
    return { totalToday, completed, totalPets };
  }, [upcomingAppointments, appointments, pets]);


  return (
    <>
      <header>
         <h1 className="text-3xl font-bold font-headline">
          Olá, Dra. Emily!
        </h1>
        <p className="text-muted-foreground">
          Bem-vinda ao seu painel. Aqui está um resumo do seu dia.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalToday > 0 ? `${stats.totalToday} agendadas para hoje` : "Nenhuma consulta para hoje"}
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPets}</div>
            <p className="text-xs text-muted-foreground">
              pacientes cadastrados na clínica
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão (Mês)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <p className="text-xs text-muted-foreground">
              +15.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Pacientes (Mês)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Agenda do Dia</CardTitle>
            <CardDescription>
             Estes são os seus compromissos para hoje, {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/professional/agenda">
              Ver Agenda Completa
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Tutor(a)</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => {
                  const pet = pets.find((p) => p.id === apt.petId);
                  return (
                    <TableRow key={apt.id}>
                        <TableCell className="font-semibold">
                            {new Date(apt.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                        </TableCell>
                       <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                {pet && <AvatarImage src={pet.avatarUrl} alt={pet.name} />}
                                <AvatarFallback>{apt.petName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{apt.petName}</div>
                          </div>
                      </TableCell>
                       <TableCell>Maria Silva</TableCell>
                      <TableCell>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {apt.service}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={apt.status === "Confirmado" ? "default" : "secondary"}>
                            {apt.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhuma consulta agendada para hoje.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
