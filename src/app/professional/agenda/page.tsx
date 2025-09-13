'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useTransition } from 'react';
import { addDays, format, startOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppointments } from '@/context/AppointmentsContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePets } from '@/context/PetsContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const vets = ['Dra. Emily Carter', 'Dr. Ben Jacobs'];
const timeSlots = Array.from({ length: 9 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`); // 9:00 to 17:00
const services = [
  'Check-up de Rotina',
  'Vacinação',
  'Limpeza Dental',
  'Consulta para Cirurgia',
  'Banho e Tosa',
  'Atendimento de Emergência',
];


const newAppointmentSchema = z.object({
  petId: z.string({ required_error: 'Selecione um pet.' }),
  serviceType: z.string({ required_error: 'Selecione um serviço.' }),
  time: z.string({ required_error: 'Selecione um horário.' }),
  vet: z.string({ required_error: 'Selecione um veterinário.' }),
});

type NewAppointmentValues = z.infer<typeof newAppointmentSchema>;

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { appointments, addAppointment, loading: appointmentsLoading } = useAppointments();
    const { pets, loading: petsLoading } = usePets();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, startSubmittingTransition] = useTransition();

    const form = useForm<NewAppointmentValues>({
        resolver: zodResolver(newAppointmentSchema),
    });

    const appointmentsByDay = useMemo(() => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.getFullYear() === currentDate.getFullYear() &&
                   aptDate.getMonth() === currentDate.getMonth() &&
                   aptDate.getDate() === currentDate.getDate();
        });
    }, [currentDate, appointments]);

    const handlePrevDay = () => {
        setCurrentDate(subDays(currentDate, 1));
    }
    const handleNextDay = () => {
        setCurrentDate(addDays(currentDate, 1));
    }
    const handleToday = () => {
        setCurrentDate(new Date());
    }

    const handleAddAppointment = (data: NewAppointmentValues) => {
        startSubmittingTransition(async () => {
            const selectedPet = pets.find(p => String(p.id) === data.petId);
            if (!selectedPet) return;

            const [hours, minutes] = data.time.split(':');
            const appointmentDate = new Date(currentDate);
            appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            try {
                await addAppointment({
                    petId: selectedPet.id,
                    petName: selectedPet.name,
                    service: data.serviceType,
                    date: appointmentDate.toISOString(),
                    status: 'Confirmado',
                }, data.vet);

                toast({
                    title: "Agendamento Criado!",
                    description: `A consulta para ${selectedPet.name} foi marcada com ${data.vet}.`
                });
                form.reset();
                setIsModalOpen(false);
            } catch (error) {
                console.error("Erro ao agendar consulta:", error);
                 toast({
                    variant: 'destructive',
                    title: "Erro",
                    description: "Não foi possível agendar a consulta. Tente novamente."
                });
            }
        });
    }

    const isLoading = appointmentsLoading || petsLoading;


  return (
    <>
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <CalendarIcon className="w-8 h-8" />
                Agenda da Clínica
            </h1>
            <p className="text-muted-foreground">
                Visualize e gerencie todos os agendamentos.
            </p>
        </div>
         <div className='flex items-center gap-2'>
            <Button variant="outline" onClick={handlePrevDay}><ChevronLeft className='h-4 w-4'/></Button>
             <div className='font-semibold text-lg text-center min-w-[200px]'>
                {format(currentDate, 'PPP', { locale: ptBR })}
            </div>
            <Button variant="outline" onClick={handleNextDay}><ChevronRight className='h-4 w-4'/></Button>
            <Button variant="outline" onClick={handleToday}>Hoje</Button>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button disabled={petsLoading}>
                        {petsLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <PlusCircle className='mr-2 h-4 w-4' />}
                        Nova Consulta
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agendar Nova Consulta</DialogTitle>
                        <DialogDescription>
                            Preencha os dados para criar um novo agendamento para o dia {format(currentDate, 'PPP', { locale: ptBR })}.
                        </DialogDescription>
                    </DialogHeader>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddAppointment)} className="space-y-4 py-4">
                            <FormField control={form.control} name="petId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paciente</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um pet" /></SelectTrigger></FormControl>
                                        <SelectContent>{pets.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="serviceType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Serviço</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger></FormControl>
                                        <SelectContent>{services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="vet" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Veterinário(a)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                            <SelectContent>{vets.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="time" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Horário</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                            <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                  {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                  Confirmar Agendamento
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

        </div>
      </header>

      <Card className="flex-1">
        <CardContent className="p-0">
          <div className='overflow-x-auto'>
            {isLoading ? (
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-[auto_repeat(2,_minmax(200px,_1fr))] min-w-[800px]">
                    {/* Time Column */}
                    <div className="border-r">
                        <div className="p-2 border-b h-20 flex items-center justify-center font-semibold">Horário</div>
                        {timeSlots.map(time => (
                            <div key={time} className="flex items-center justify-center border-b h-20 text-sm font-semibold text-muted-foreground">{time}</div>
                        ))}
                    </div>
                    
                    {/* Vet Columns */}
                    {vets.map(vet => (
                        <div key={vet} className="border-r last:border-r-0">
                            <div className="p-2 border-b h-20 flex items-center justify-center text-center">
                                <h3 className='font-bold text-lg'>{vet}</h3>
                            </div>
                            {timeSlots.map(slot => {
                                const appointment = appointmentsByDay.find(a => {
                                    const aptDate = new Date(a.date);
                                    const aptTime = `${String(aptDate.getHours()).padStart(2,'0')}:${String(aptDate.getMinutes()).padStart(2,'0')}`;
                                    return aptTime === slot && a.vet === vet;
                                });

                                return (
                                    <div key={`${vet}-${slot}`} className="border-b h-20 p-1">
                                        {appointment && (
                                            <div className='bg-primary/10 border-l-4 border-primary text-primary-foreground p-2 rounded-md h-full flex flex-col justify-center text-left cursor-pointer hover:bg-primary/20'>
                                                <p className='font-bold text-sm text-primary'>{appointment.petName}</p>
                                                <p className='text-xs text-primary/80'>{appointment.service}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
