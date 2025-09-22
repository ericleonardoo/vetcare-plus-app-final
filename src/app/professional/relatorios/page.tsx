'use client';

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoices } from '@/context/InvoicesContext';
import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppointments } from '@/context/AppointmentsContext';
import { useTutors } from '@/context/TutorsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
    const { invoices, loading: invoicesLoading } = useInvoices();
    const { appointments, loading: appointmentsLoading } = useAppointments();
    const { tutors, loading: tutorsLoading } = useTutors();

    const isLoading = invoicesLoading || appointmentsLoading || tutorsLoading;

    const financialReport = useMemo(() => {
        const last30Days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
        const dailyRevenue = last30Days.map(day => ({
            date: format(day, 'dd/MM'),
            Receita: 0,
        }));

        let totalRevenue = 0;
        let pendingAmount = 0;

        invoices.forEach(invoice => {
            if (invoice.status === 'Pago' && invoice.paidAt) {
                const paidDate = invoice.paidAt.toDate();
                if (paidDate >= subDays(new Date(), 30)) {
                    const dayString = format(paidDate, 'dd/MM');
                    const dayData = dailyRevenue.find(d => d.date === dayString);
                    if (dayData) {
                        dayData.Receita += invoice.totalAmount;
                    }
                }
                totalRevenue += invoice.totalAmount;
            } else {
                pendingAmount += invoice.totalAmount;
            }
        });

        return { dailyRevenue, totalRevenue, pendingAmount };

    }, [invoices]);
    
    const servicesReport = useMemo(() => {
        const serviceCount: { [key: string]: number } = {};
        invoices.forEach(invoice => {
            invoice.items.forEach(item => {
                serviceCount[item.description] = (serviceCount[item.description] || 0) + 1;
            });
        });

        return Object.entries(serviceCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => b.value - a.value)
            .slice(0, 7); // Top 7 services
    }, [invoices]);
    
    const clientsReport = useMemo(() => {
        const clientData: { [id: string]: { name: string, revenue: number, appointments: number } } = {};

        tutors.forEach(tutor => {
            clientData[tutor.id] = { name: tutor.name, revenue: 0, appointments: 0 };
        });

        invoices.forEach(invoice => {
            if (clientData[invoice.clientId] && invoice.status === 'Pago') {
                clientData[invoice.clientId].revenue += invoice.totalAmount;
            }
        });

        appointments.forEach(appointment => {
            if (clientData[appointment.tutorId]) {
                clientData[appointment.tutorId].appointments += 1;
            }
        });

        return Object.values(clientData).sort((a,b) => b.revenue - a.revenue).slice(0, 10);

    }, [invoices, appointments, tutors]);
    
    const scheduleReport = useMemo(() => {
        const data = [
            { name: 'Seg', Agendamentos: 0 },
            { name: 'Ter', Agendamentos: 0 },
            { name: 'Qua', Agendamentos: 0 },
            { name: 'Qui', Agendamentos: 0 },
            { name: 'Sex', Agendamentos: 0 },
            { name: 'Sáb', Agendamentos: 0 },
        ];
        appointments.forEach(apt => {
            const dayIndex = (parseISO(apt.date).getDay() + 6) % 7;
            if (dayIndex < 6) { // 0=Seg, 5=Sab
                data[dayIndex].Agendamentos++;
            }
        });
        return data;
    }, [appointments]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
    }

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold font-headline">Relatórios e Analytics</h1>
        <p className="text-muted-foreground">
          Insights para a gestão estratégica da sua clínica.
        </p>
      </header>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
              <CardHeader>
                  <CardTitle>Faturamento Bruto Total</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-3xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialReport.totalRevenue)}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Total a Receber</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-3xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialReport.pendingAmount)}</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle>Total de Clientes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-3xl font-bold">{tutors.length}</p>
              </CardContent>
          </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Receita nos Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={financialReport.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={val => `R$${val}`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="Receita" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Serviços Mais Realizados</CardTitle>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={servicesReport} layout="vertical">
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis type="number" />
                         <YAxis type="category" dataKey="name" width={150} />
                         <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }}/>
                         <Bar dataKey="value" fill="hsl(var(--primary))" name="Quantidade"/>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Clientes por Faturamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead className='text-right'>Faturamento</TableHead>
                                <TableHead className='text-right'>Consultas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientsReport.map(client => (
                                <TableRow key={client.name}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell className='text-right'>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.revenue)}</TableCell>
                                    <TableCell className='text-right'>{client.appointments}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ocupação da Agenda por Dia da Semana</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scheduleReport}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }}/>
                            <Bar dataKey="Agendamentos" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
       </div>
    </>
  );
}
