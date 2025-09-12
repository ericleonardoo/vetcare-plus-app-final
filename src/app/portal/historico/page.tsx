
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Stethoscope,
  Syringe,
  ClipboardList,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const healthHistory = [
  {
    petName: 'Paçoca',
    date: '2024-07-20',
    type: 'Consulta',
    icon: Stethoscope,
    title: 'Limpeza Dental',
    vet: 'Dra. Emily Carter',
    details:
      'Procedimento de limpeza dental realizado com sucesso. O Paçoca se comportou muito bem. Recomendado o uso de brinquedos para saúde dental.',
  },
  {
    petName: 'Whiskers',
    date: '2024-06-05',
    type: 'Emergência',
    icon: Stethoscope,
    title: 'Consulta de Emergência',
    vet: 'Dr. Ben Jacobs',
    details:
      'Whiskers apresentou apatia e falta de apetite. Diagnosticado com infecção gástrica leve. Medicado e liberado.',
  },
  {
    petName: 'Paçoca',
    date: '2024-03-10',
    type: 'Vacina',
    icon: Syringe,
    title: 'Vacina Polivalente (V10)',
    vet: 'Dra. Emily Carter',
    details: 'Dose de reforço anual da vacina V10. Nenhuma reação adversa.',
  },
  {
    petName: 'Whiskers',
    date: '2023-12-15',
    type: 'Exame',
    icon: ClipboardList,
    title: 'Exames de Sangue de Rotina',
    vet: 'Dr. Ben Jacobs',
    details: 'Hemograma completo e perfil bioquímico. Todos os resultados dentro dos parâmetros normais. Excelente estado de saúde.',
  },
];

export default function HealthHistoryPage() {
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
            <Select defaultValue="todos">
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por pet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Pets</SelectItem>
                <SelectItem value="pacoca">Paçoca</SelectItem>
                <SelectItem value="whiskers">Whiskers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            {/* Linha do tempo vertical */}
            <div className="absolute left-9 top-0 h-full w-0.5 bg-border" />

            {healthHistory.map((item, index) => (
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
            ))}
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
