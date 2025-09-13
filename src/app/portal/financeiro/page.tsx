
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Wallet, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Dados de exemplo, que viriam do Firestore no futuro.
const invoicesData = [
  {
    invoiceId: 'FAT-00125',
    date: '2024-07-20',
    petName: 'Paçoca',
    service: 'Limpeza Dental',
    amount: 'R$ 350,00',
    status: 'Pago' as const,
  },
  {
    invoiceId: 'FAT-00124',
    date: '2024-06-05',
    petName: 'Whiskers',
    service: 'Consulta de Emergência',
    amount: 'R$ 450,00',
    status: 'Pago' as const,
  },
  {
    invoiceId: 'FAT-00120',
    date: '2024-03-10',
    petName: 'Paçoca',
    service: 'Vacina Polivalente (V10)',
    amount: 'R$ 120,00',
    status: 'Pago' as const,
  },
  {
    invoiceId: 'FAT-00115',
    date: '2023-12-15',
    petName: 'Whiskers',
    service: 'Exames de Sangue',
    amount: 'R$ 280,00',
    status: 'Pago' as const,
  },
];

export default function FinancialPage() {
  // Simula um estado de carregamento, que seria real com o Firestore.
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState(invoicesData);


  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'default';
      case 'Pendente':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3"><Wallet className="w-8 h-8" />Financeiro</h1>
        <p className="text-muted-foreground">
          Visualize seu histórico de pagamentos e faturas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
          <CardDescription>
            Acesse e baixe os detalhes de todos os seus pagamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Fatura</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
              ) : invoices.length > 0 ? (
                invoices.map((invoice) => (
                    <TableRow key={invoice.invoiceId}>
                    <TableCell className="font-medium">
                        {invoice.invoiceId}
                    </TableCell>
                    <TableCell>
                        {new Date(invoice.date + 'T12:00:00').toLocaleDateString(
                        'pt-BR',
                        { day: '2-digit', month: '2-digit', year: 'numeric' }
                        )}
                    </TableCell>
                    <TableCell>{invoice.petName}</TableCell>
                    <TableCell>{invoice.service}</TableCell>
                    <TableCell className="text-right">{invoice.amount}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Baixar Fatura</span>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        Nenhuma fatura encontrada.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
