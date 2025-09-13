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
import { useEffect, useState, useTransition } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getSuggestedTimesForPortal } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { usePets } from '@/context/PetsContext';
import { useAppointments } from '@/context/AppointmentsContext';
import { useRouter } from 'next/navigation';

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
  time: z.string({ required_error: 'Por favor, selecione um horário.' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function NewAppointmentPage() {
  const [isFindingTimes, startFindingTimesTransition] = useTransition();
  const [isSubmitting, startSubmittingTransition] = useTransition();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const { toast } = useToast();
  const [timeZone, setTimeZone] = useState('');
  const { pets } = usePets();
  const { addAppointment } = useAppointments();
  const router = useRouter();


  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const { watch, resetField, setValue, getValues, setError, control, handleSubmit } = form;
  const selectedDate = watch('date');
  const selectedPetId = watch('petId');

  useEffect(() => {
    setAvailableTimes([]);
    setValue('time', undefined);
  }, [selectedDate, setValue]);


  function onSubmit(data: FormValues) {
     startSubmittingTransition(async () => {
        const selectedPet = pets.find(p => p.id === data.petId);
        if (!selectedPet) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Pet não encontrado.',
          });
          return;
        }

        try {
          await addAppointment({
            petId: selectedPet.id,
            petName: selectedPet.name,
            service: data.serviceType,
            date: data.time,
            status: 'Confirmado',
          });

          toast({
            title: "Agendamento Confirmado!",
            description: `Sua consulta para ${selectedPet.name} no dia ${format(new Date(data.time), 'PPP', {locale: ptBR})} às ${format(new Date(data.time!), 'p', { locale: ptBR })} foi marcada.`,
          });
          router.push('/portal/agendamentos');
        } catch (error) {
            console.error("Erro ao agendar consulta:", error);
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível agendar a consulta. Tente novamente.'
            });
        }
     });
  }

  function onFindTimes() {
    const serviceType = getValues('serviceType');
    if (!serviceType) {
        setError('serviceType', { message: 'Selecione um serviço para ver os horários.'});
        return;
    }
    if (!selectedDate) {
        setError('date', { message: 'Selecione uma data para ver os horários.'});
        return;
    }

    startFindingTimesTransition(async () => {
      const result = await getSuggestedTimesForPortal({
        serviceType,
        timeZone,
        date: selectedDate,
      });

      if (result.success && result.data) {
        setAvailableTimes(result.data);
         if (result.data.length === 0) {
          toast({
            variant: 'default',
            title: 'Sem horários disponíveis',
            description: 'Não há horários disponíveis para este serviço no dia selecionado. Por favor, tente outra data.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: result.error,
        });
      }
    });
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={control}
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
                  control={control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviço</FormLabel>
                      <Select onValueChange={(value) => {
                          field.onChange(value);
                          setAvailableTimes([]);
                          resetField('time');
                      }} defaultValue={field.value}>
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
                control={control}
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
                            disabled={!selectedPetId}
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

                {watch('date') && watch('serviceType') && (
                    <div className='space-y-4'>
                         {!isFindingTimes && availableTimes.length === 0 && (
                            <div className='text-center'>
                                <Button onClick={onFindTimes} disabled={isFindingTimes} className='w-full max-w-sm mx-auto' type='button'>
                                    {isFindingTimes ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando horários...</> : 'Ver Horários Disponíveis'}
                                </Button>
                            </div>
                         )}
                         {isFindingTimes && <p className='text-muted-foreground animate-pulse text-center'>Buscando horários para o dia selecionado...</p>}
                         {availableTimes.length > 0 && (
                             <FormField
                                control={control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                      <FormLabel className='text-base text-center block'>Escolha um horário</FormLabel>
                                      <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {availableTimes.map(time => (
                                                <div key={time}>
                                                    <RadioGroupItem value={time} id={time} className="sr-only" />
                                                    <Label htmlFor={time} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer text-lg">
                                                        {format(new Date(time), 'p', { locale: ptBR })}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                      </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                         )}
                    </div>
                )}
              
              <FormField
                control={control}
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
                <Button variant="outline" asChild><Link href="/portal/agendamentos">Cancelar</Link></Button>
                <Button type="submit" disabled={!watch('time') || isFindingTimes || isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmar Agendamento
                </Button>
            </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
