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
import { File, ListFilter, Loader2, Package, PlusCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInventory, InventoryItem } from '@/context/InventoryContext';
import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const itemSchema = z.object({
  productName: z.string().min(3, "O nome do produto é obrigatório."),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0, "A quantidade não pode ser negativa."),
  unitCost: z.coerce.number().min(0, "O custo deve ser positivo."),
  supplier: z.string().optional(),
});
type ItemFormValues = z.infer<typeof itemSchema>;


export default function InventoryPage() {
  const { inventory, loading, addItem, updateItem, deleteItem } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
  });

  const handleOpenModal = (item: InventoryItem | null = null) => {
    setEditingItem(item);
    if (item) {
      form.reset(item);
    } else {
      form.reset({ productName: '', description: '', quantity: 0, unitCost: 0, supplier: '' });
    }
    setIsModalOpen(true);
  }

  const onSubmit = (data: ItemFormValues) => {
    startSubmitting(async () => {
      try {
        if (editingItem) {
          await updateItem(editingItem.id, data);
          toast({ title: "Produto Atualizado!", description: `O item '${data.productName}' foi atualizado.` });
        } else {
          await addItem(data);
          toast({ title: "Produto Adicionado!", description: `O novo item '${data.productName}' foi adicionado ao estoque.` });
        }
        setIsModalOpen(false);
      } catch (error) {
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível salvar o produto." });
      }
    });
  }
  
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    startSubmitting(async () => {
      try {
        await deleteItem(itemToDelete.id);
        toast({ title: "Produto Removido!", description: `${itemToDelete.productName} foi removido do estoque.` });
        setIsDeleteAlertOpen(false);
        setItemToDelete(null);
      } catch(error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível remover o produto.' });
      }
    });
  }

  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteAlertOpen(true);
  }

  const getStockVariant = (quantity: number) => {
    if (quantity === 0) return 'destructive';
    if (quantity <= 5) return 'secondary';
    return 'default';
  };
  
   const getStockStatus = (quantity: number) => {
    if (quantity === 0) return 'Sem estoque';
    if (quantity <= 5) return 'Estoque baixo';
    return 'Em estoque';
  };

  const TableSkeleton = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-24" /></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
  );

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Package className="w-8 h-8" />
            Gerenciamento de Estoque
          </h1>
          <p className="text-muted-foreground">
            Adicione, edite e monitore os produtos da clínica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={() => handleOpenModal()}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Adicionar Produto
            </span>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os produtos disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : inventory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço de Custo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {inventory.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell>{product.supplier || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStockVariant(product.quantity)}>
                          {getStockStatus(product.quantity)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(product.unitCost)}
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(product)}>Editar</Button>
                        <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(product)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Seu estoque está vazio</h3>
              <p className="mt-2 text-sm text-muted-foreground">Comece adicionando o seu primeiro produto para controlar o inventário.</p>
              <Button className="mt-6" onClick={() => handleOpenModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
            <DialogDescription>Preencha os detalhes do produto para o inventário.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
              <FormField control={form.control} name="productName" render={({field}) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl><Input placeholder='Ex: Ração Super Premium' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className='grid grid-cols-2 gap-4'>
                <FormField control={form.control} name="quantity" render={({field}) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="unitCost" render={({field}) => (
                  <FormItem>
                    <FormLabel>Custo Unitário (R$)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="supplier" render={({field}) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <FormControl><Input placeholder='Nome do fornecedor' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Produto
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso removerá permanentemente o produto <span className='font-bold'>{itemToDelete?.productName}</span> do seu inventário.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sim, remover produto
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
