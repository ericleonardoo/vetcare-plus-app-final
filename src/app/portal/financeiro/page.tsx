import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function FinancialPage() {
  return (
    <div className="flex flex-col gap-8">
       <div>
          <h1 className="text-3xl font-bold font-headline">Financeiro</h1>
          <p className="text-muted-foreground">
            Visualize seu histórico de pagamentos e faturas.
          </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Em Breve</CardTitle>
                <CardDescription>
                    Esta seção está em desenvolvimento. Em breve, você poderá acessar todo o seu histórico financeiro, incluindo faturas detalhadas e recibos.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-16">
                <CreditCard className="w-16 h-16 mb-4" />
                <p className="font-semibold">Seu histórico de transações aparecerá aqui.</p>
            </CardContent>
        </Card>
    </div>
  );
}
