
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
import { Download, Wallet, Loader2, Receipt } from 'lucide-react';
import { useInvoices } from '@/context/InvoicesContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinancialPage() {
  const { invoices, loading } = useInvoices();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'default';
      case 'Pendente':
        return 'destructive';
      case 'Atrasado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const TableSkeleton = () => (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="text-center"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
            <TableCell className='text-right'><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3"><Wallet className="w-8 h-8" />Minhas Faturas</h1>
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
          {loading ? (
            <TableSkeleton />
          ) : invoices.length > 0 ? (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Fatura</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Serviço Principal</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                          #{invoice.invoiceId}
                      </TableCell>
                      <TableCell>
                          {new Date(invoice.createdAt.toDate()).toLocaleDateString(
                          'pt-BR',
                          { day: '2-digit', month: '2-digit', year: 'numeric' }
                          )}
                      </TableCell>
                      <TableCell>{invoice.petName}</TableCell>
                      <TableCell>{invoice.items[0]?.description || 'N/A'}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}</TableCell>
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
                  ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma fatura encontrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">O histórico de faturas dos seus atendimentos aparecerá aqui.</p>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
