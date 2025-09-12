
'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data
const pets = [
  { id: 1, name: 'Paçoca' },
  { id: 2, name: 'Whiskers' },
];

const services = [
  'Check-up de Rotina',
  'Vacinação',
  'Limpeza Dental',
  'Consulta para Cirurgia',
  'Banho e Tosa',
  'Atendimento de Emergência',
];

const FormSchema = z.object({
  petId: z.string({ required_error: 'Por favor, selecione um pet.' }),
  serviceType: z.string({ required_error: 'Por favor, selecione um serviço.' }),
  date: z.date({ required_error: 'Por favor, selecione uma data.' }),
  time: z.string().optional(),
  notes: z.string().optional(),
});

export default function NewAppointmentPage() {
  const [isFindingTimes, setIsFindingTimes] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    // Aqui viria a lógica de submissão para a API
  }

  function onFindTimes() {
      setIsFindingTimes(true);
      // Simula uma busca na API
      setTimeout(() => {
          setAvailableTimes(['09:00', '10:00', '11:00', '14:00', '15:00']);
          setIsFindingTimes(false);
      }, 1500)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/agendamentos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Agendamentos
          </Link>
        </Button>
      </div>
      <Card className="max-w-3xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="font-headline">Agendar Nova Consulta</CardTitle>
          <CardDescription>
            Escolha o pet, o serviço e o melhor horário para a consulta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="petId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o pet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pets.map(pet => (
                            <SelectItem key={pet.id} value={String(pet.id)}>{pet.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviço</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {services.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data da Consulta</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                                <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date < new Date(new Date().setHours(0,0,0,0))
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {form.watch('date') && (
                    <div className='space-y-4 text-center'>
                         {!isFindingTimes && availableTimes.length === 0 && (
                            <Button onClick={onFindTimes} disabled={isFindingTimes} className='w-full max-w-sm mx-auto'>
                                {isFindingTimes ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando horários...</> : 'Ver Horários Disponíveis'}
                            </Button>
                         )}
                         {isFindingTimes && <p className='text-muted-foreground animate-pulse'>Buscando horários para o dia selecionado...</p>}
                         {availableTimes.length > 0 && (
                             <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Escolha um horário</FormLabel>
                                    <FormControl>
                                        <div className='flex flex-wrap gap-2 justify-center'>
                                            {availableTimes.map(time => (
                                                <Button key={time} type='button' variant={field.value === time ? 'default' : 'outline'} onClick={() => field.onChange(time)}>{time}</Button>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                         )}
                    </div>
                )}
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionais</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informe qualquer detalhe relevante para a consulta..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Sintomas, comportamento recente, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="flex justify-end gap-2 pt-8">
                <Button variant="outline" asChild><Link href="/portal/dashboard">Cancelar</Link></Button>
                <Button type="submit" disabled={!form.watch('time')}>Confirmar Agendamento</Button>
            </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

