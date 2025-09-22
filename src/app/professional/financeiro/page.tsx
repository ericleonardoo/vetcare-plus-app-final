
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
import { ListFilter, File, Wallet, Loader2, CheckCircle, Clock, Receipt } from 'lucide-react';
import { useInvoices, Invoice } from '@/context/InvoicesContext';
import { useTutors } from '@/context/TutorsContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useState, useMemo, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfessionalFinancialPage() {
  const { invoices, loading, updateInvoiceStatus } = useInvoices();
  const { tutors, loading: tutorsLoading } = useTutors();
  const [filter, setFilter] = useState({ 'Pendente': true, 'Pago': true, 'Atrasado': true });
  const [invoiceToUpdate, setInvoiceToUpdate] = useState<Invoice | null>(null);
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const { toast } = useToast();

  const filteredInvoices = useMemo(() => {
    return invoices
        .filter(inv => filter[inv.status as keyof typeof filter])
        .sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }, [invoices, filter]);

  const handleUpdateStatus = () => {
    if (!invoiceToUpdate) return;
    startUpdateTransition(async () => {
        try {
            await updateInvoiceStatus(invoiceToUpdate.id, 'Pago');
            toast({
                title: 'Status Alterado!',
                description: `A fatura #${invoiceToUpdate.invoiceId} foi marcada como paga.`
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o status da fatura.'})
        } finally {
            setInvoiceToUpdate(null);
        }
    });
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'default';
      case 'Pendente':
        return 'secondary';
      case 'Atrasado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isLoading = loading || tutorsLoading;

  const TableSkeleton = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-32 ml-auto" /></TableHead>
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
                    <TableCell className='text-center'><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                    <TableCell className='text-right'><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
  );

  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3"><Wallet className="w-8 h-8" />Financeiro</h1>
            <p className="text-muted-foreground">
            Gerencie faturas, pagamentos e a saúde financeira da clínica.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filtrar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={filter.Pendente} onCheckedChange={checked => setFilter(f => ({...f, 'Pendente': checked}))}>Pendente</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filter.Pago} onCheckedChange={checked => setFilter(f => ({...f, 'Pago': checked}))}>Pago</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filter.Atrasado} onCheckedChange={checked => setFilter(f => ({...f, 'Atrasado': checked}))}>Atrasado</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exportar</span>
            </Button>
          </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
          <CardDescription>
            Acesse, filtre e gerencie todas as faturas emitidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredInvoices.map((invoice) => {
                      const tutor = tutors.find(t => t.id === invoice.clientId);
                      return (
                          <TableRow key={invoice.id}>
                              <TableCell className="font-medium">#{invoice.invoiceId}</TableCell>
                              <TableCell>{new Date(invoice.createdAt.toDate()).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell>{tutor?.name || 'N/A'}</TableCell>
                              <TableCell>{invoice.petName}</TableCell>
                              <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.totalAmount)}</TableCell>
                              <TableCell className="text-center"><Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge></TableCell>
                              <TableCell className="text-right">
                                  {invoice.status !== 'Pago' && (
                                      <Button variant="outline" size="sm" onClick={() => setInvoiceToUpdate(invoice)}>Marcar como Paga</Button>
                                  )}
                              </TableCell>
                          </TableRow>
                      )
                  })}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma fatura encontrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">Não há faturas que correspondam aos filtros selecionados.</p>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
    <AlertDialog open={!!invoiceToUpdate} onOpenChange={(isOpen) => !isOpen && setInvoiceToUpdate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você confirma o recebimento do valor de <span className='font-bold'>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceToUpdate?.totalAmount || 0)}</span> para a fatura <span className='font-bold'>#{invoiceToUpdate?.invoiceId}</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus} disabled={isUpdatePending}>
              {isUpdatePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className='mr-2 h-4 w-4'/>}
              Sim, confirmar pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
