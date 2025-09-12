
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Cake, Bone, Cat, Dog, Heart, Stethoscope, Syringe, ClipboardList, Pencil, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useTransition } from 'react';
import { generateCarePlan } from '@/lib/actions';
import type { GenerateCarePlanOutput } from '@/ai/flows/generate-care-plan';


// Mock data - em um app real, isso viria do seu banco de dados
const allPets = [
  {
    id: 1,
    name: 'Paçoca',
    species: 'Cachorro',
    breed: 'Vira-lata Caramelo',
    age: '3 anos',
    birthDate: '2021-05-10',
    gender: 'Macho',
    avatarUrl: 'https://picsum.photos/seed/brasil1/200/200',
    avatarHint: 'dog brazil',
    healthHistory: [
        { date: '2024-07-20', type: 'Consulta', title: 'Limpeza Dental', vet: 'Dra. Emily Carter', icon: Stethoscope },
        { date: '2024-03-10', type: 'Vacina', title: 'Vacina Polivalente (V10)', vet: 'Dra. Emily Carter', icon: Syringe },
    ]
  },
  {
    id: 2,
    name: 'Whiskers',
    species: 'Gato',
    breed: 'Siamês',
    age: '5 anos',
    birthDate: '2019-08-25',
    gender: 'Macho',
    avatarUrl: 'https://picsum.photos/seed/pet2/200/200',
    avatarHint: 'siamese cat',
     healthHistory: [
      { date: '2024-06-05', type: 'Emergência', title: 'Consulta de Emergência', vet: 'Dr. Ben Jacobs', icon: Stethoscope },
      { date: '2023-12-15', type: 'Exame', title: 'Exames de Sangue', vet: 'Dr. Ben Jacobs', icon: ClipboardList },
    ]
  },
];


export default function PetDetailPage({ params }: { params: { id: string } }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [carePlan, setCarePlan] = useState<GenerateCarePlanOutput | null>(null);


  // Encontrar o pet com base no ID da URL
  const pet = allPets.find((p) => p.id === parseInt(params.id));

  const handleGenerateCarePlan = () => {
    if (!pet) return;
    startTransition(async () => {
        const result = await generateCarePlan({
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            healthHistory: `Este é um ${pet.species} da raça ${pet.breed} com ${pet.age}. O histórico recente inclui: ${pet.healthHistory.map(h => h.title).join(', ')}.`
        });

        if (result.success) {
            setCarePlan(result.data);
            toast({
              title: "Plano de Cuidados Gerado!",
              description: `Um novo plano de cuidados foi criado para ${pet.name}.`,
            });
        } else {
            toast({
              variant: 'destructive',
              title: "Erro ao gerar plano",
              description: result.error,
            });
        }
    });
  };

  if (!pet) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Pet não encontrado</h1>
        <p className="text-muted-foreground">O pet que você está procurando não existe.</p>
        <Button asChild className="mt-4">
          <Link href="/portal/pets">Voltar para Meus Pets</Link>
        </Button>
      </div>
    );
  }
  
  const PetIcon = pet.species === 'Gato' ? Cat : Dog;

  return (
    <div className="flex flex-col gap-8">
       <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Meus Pets
          </Link>
        </Button>
      </div>
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1 flex flex-col gap-8">
                <Card>
                    <CardContent className="p-6 text-center flex flex-col items-center">
                        <Avatar className="h-32 w-32 mb-4">
                            <AvatarImage src={pet.avatarUrl} alt={pet.name} data-ai-hint={pet.avatarHint} />
                            <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-3xl font-bold font-headline">{pet.name}</h1>
                        <p className="text-muted-foreground">{pet.breed}</p>
                         <Button variant="outline" size="sm" className="mt-4 w-full">
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Perfil
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                            <PetIcon className="h-5 w-5 text-muted-foreground" />
                            <span>Espécie: <span className="font-medium">{pet.species}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Bone className="h-5 w-5 text-muted-foreground" />
                            <span>Raça: <span className="font-medium">{pet.breed}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Cake className="h-5 w-5 text-muted-foreground" />
                            <span>Idade: <span className="font-medium">{pet.age}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Heart className="h-5 w-5 text-muted-foreground" />
                            <span>Gênero: <span className="font-medium">{pet.gender}</span></span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2 flex flex-col gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Plano de Cuidados Personalizado (IA)</CardTitle>
                        <CardDescription>
                            Gere recomendações de saúde e bem-estar para o {pet.name} com base em suas características.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {carePlan ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-secondary rounded-lg">
                                    <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> {carePlan.nutrition.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{carePlan.nutrition.recommendation}</p>
                                </div>
                                <div className="p-4 bg-secondary rounded-lg">
                                    <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> {carePlan.exercise.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{carePlan.exercise.recommendation}</p>
                                </div>
                                <div className="p-4 bg-secondary rounded-lg">
                                    <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> {carePlan.preventiveHealth.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{carePlan.preventiveHealth.recommendation}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 border-2 border-dashed rounded-lg">
                                <BrainCircuit className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">Ainda não há um plano de cuidados para {pet.name}.</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-center">
                         <Button onClick={handleGenerateCarePlan} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {carePlan ? "Gerar Novo Plano" : "Gerar Plano de Cuidados com IA"}
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Histórico de Saúde Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {pet.healthHistory.map((item, index) => (
                                <li key={index} className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(item.date + "T00:00:00").toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'})} - {item.vet}</p>
                                    </div>
                                     <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                                        {item.type}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                     <CardFooter className="border-t pt-4 flex justify-center">
                         <Button variant="secondary" asChild>
                            <Link href="/portal/historico">Ver Histórico Completo</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
