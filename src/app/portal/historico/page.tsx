import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText } from 'lucide-react';

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
            <CardHeader>
                <CardTitle>Em Breve</CardTitle>
                <CardDescription>
                    Esta seção está em desenvolvimento. Em breve, você poderá visualizar o histórico completo de consultas, vacinas, exames e procedimentos dos seus pets.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-16">
                <FileText className="w-16 h-16 mb-4" />
                <p className="font-semibold">A linha do tempo da saúde do seu pet aparecerá aqui.</p>
            </CardContent>
        </Card>
    </div>
  );
}
