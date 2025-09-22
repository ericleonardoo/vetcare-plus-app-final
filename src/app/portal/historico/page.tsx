'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText, Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePets } from '@/context/PetsContext';
import { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HealthHistoryPage() {
  const { pets, loading } = usePets();
  const [selectedPetId, setSelectedPetId] = useState('todos');

  const allHistoryItems = useMemo(() => {
    return pets.flatMap(pet => 
      pet.healthHistory.map(item => ({ ...item, petName: pet.name }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pets]);

  const filteredHistory = useMemo(() => {
    if (selectedPetId === 'todos') {
      return allHistoryItems;
    }
    return allHistoryItems.filter(item => {
      const pet = pets.find(p => p.name === item.petName);
      return pet && String(pet.id) === selectedPetId;
    });
  }, [allHistoryItems, selectedPetId, pets]);

  const TimelineSkeleton = () => (
    <div className="relative pl-6">
      <div className="absolute left-9 top-0 h-full w-0.5 bg-border" />
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex gap-6 mb-10">
          <Skeleton className="z-10 flex h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-1/5" />
            </div>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-48" />
                </CardHeader>
                <CardContent>
                    <TimelineSkeleton />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Histórico de Saúde</h1>
        <p className="text-muted-foreground">
          Acompanhe todo o histórico de saúde dos seus pets em um só lugar.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Linha do Tempo da Saúde</CardTitle>
            <CardDescription>
              Visualize o histórico de consultas, vacinas e exames.
            </CardDescription>
          </div>
          <div className="w-48">
            <Select value={selectedPetId} onValueChange={setSelectedPetId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por pet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Pets</SelectItem>
                {pets.map(pet => (
                   <SelectItem key={pet.id} value={String(pet.id)}>{pet.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            {/* Linha do tempo vertical */}
            <div className="absolute left-9 top-0 h-full w-0.5 bg-border" />

            {filteredHistory.length > 0 ? filteredHistory.map((item, index) => (
              <div key={index} className="flex gap-6 mb-10">
                <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        item.date + 'T12:00:00'
                      ).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      - {item.petName}
                    </p>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {item.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mt-1 font-headline">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Veterinário(a): {item.vet}
                  </p>
                  <p className="mt-2 text-sm">{item.details}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>Nenhum histórico encontrado para o pet selecionado.</p>
              </div>
            )}

            <div className="flex gap-6">
               <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 pt-1">
                    <p className="font-semibold text-muted-foreground">Início do histórico</p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
