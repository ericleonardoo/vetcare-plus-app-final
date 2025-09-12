'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const appointments = [
    { time: '09:00', vet: 'Dra. Emily', patient: 'Paçoca', service: 'Check-up' },
    { time: '10:00', vet: 'Dr. Ben', patient: 'Whiskers', service: 'Vacinação' },
    { time: '10:00', vet: 'Dra. Emily', patient: 'Rex', service: 'Curativo' },
    { time: '11:00', vet: 'Dra. Emily', patient: 'Luna', service: 'Consulta' },
    { time: '14:00', vet: 'Dr. Ben', patient: 'Thor', service: 'Pós-operatório' },
    { time: '15:00', vet: 'Dra. Emily', patient: 'Bella', service: 'Exames' },
];

const vets = ['Dra. Emily', 'Dr. Ben'];
const timeSlots = Array.from({ length: 9 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`); // 9:00 to 17:00

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const start = startOfWeek(currentDate, { locale: ptBR });
    const weekDays = Array.from({length: 5}, (_, i) => addDays(start, i + 1)); // Seg-Sex

    const handlePrevWeek = () => {
        setCurrentDate(addDays(currentDate, -7));
    }
    const handleNextWeek = () => {
        setCurrentDate(addDays(currentDate, 7));
    }

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
            <Button variant="outline" onClick={handlePrevWeek}><ChevronLeft className='h-4 w-4'/></Button>
            <Button variant="outline" onClick={handleNextWeek}><ChevronRight className='h-4 w-4'/></Button>
            <Button>Nova Consulta</Button>
        </div>
      </header>

      <Card className="flex-1">
        <CardContent className="p-0">
          <div className='overflow-x-auto'>
             <div className="grid grid-cols-[auto_repeat(2,_minmax(200px,_1fr))] min-w-[800px]">
                {/* Time Column */}
                <div className="border-r">
                    <div className="p-2 border-b h-24 flex items-center justify-center font-semibold">Horário</div>
                    {timeSlots.map(time => (
                        <div key={time} className="flex items-center justify-center border-b h-24 text-sm font-semibold text-muted-foreground">{time}</div>
                    ))}
                </div>
                
                {/* Vet Columns */}
                {vets.map(vet => (
                    <div key={vet} className="border-r last:border-r-0">
                        <div className="p-2 border-b h-24 flex items-center justify-center text-center">
                            <h3 className='font-bold text-lg'>{vet}</h3>
                        </div>
                        {timeSlots.map(slot => {
                            const appointment = appointments.find(a => a.time === slot && a.vet === vet);
                            return (
                                <div key={`${vet}-${slot}`} className="border-b h-24 p-1">
                                    {appointment && (
                                        <div className='bg-primary/10 border-l-4 border-primary text-primary-foreground p-2 rounded-md h-full flex flex-col justify-center text-left'>
                                            <p className='font-bold text-sm text-primary'>{appointment.patient}</p>
                                            <p className='text-xs text-primary/80'>{appointment.service}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}

             </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
