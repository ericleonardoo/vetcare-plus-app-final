
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
import { ClipboardUser, Loader2, PlusCircle, Trash2, X } from 'lucide-react';
import { useStaff, StaffMember, DayAvailability } from '@/context/StaffContext';
import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const dayNames: { [key: string]: string } = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const availabilitySchema = z.object({
  dayOfWeek: z.string(),
  isEnabled: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  breaks: z.array(z.object({ start: z.string(), end: z.string() })),
});

const staffMemberSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório."),
  role: z.string().min(3, "O cargo é obrigatório."),
  isActive: z.boolean(),
  availability: z.array(availabilitySchema),
});

type StaffFormValues = z.infer<typeof staffMemberSchema>;


export default function StaffPage() {
  const { staff, loading, addStaffMember, updateStaffMember, deleteStaffMember } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StaffMember | null>(null);
  const [editingItem, setEditingItem] = useState<StaffMember | null>(null);
  const { toast } = useToast();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffMemberSchema),
  });

  const { fields, update } = useFieldArray({
    control: form.control,
    name: 'availability',
  });
  
  const handleOpenModal = (item: StaffMember | null = null) => {
    setEditingItem(item);
    if (item) {
      form.reset({
        name: item.name,
        role: item.role,
        isActive: item.isActive,
        availability: item.availability.sort((a,b) => Object.keys(dayNames).indexOf(a.dayOfWeek) - Object.keys(dayNames).indexOf(b.dayOfWeek)),
      });
    } else {
      const defaultAvailability = Object.keys(dayNames).map(day => ({
        dayOfWeek: day,
        isEnabled: day !== 'sunday',
        startTime: '09:00',
        endTime: '18:00',
        breaks: [{ start: '12:00', end: '13:00' }],
      }));
      form.reset({
        name: '',
        role: 'Veterinário',
        isActive: true,
        availability: defaultAvailability,
      });
    }
    setIsModalOpen(true);
  }

  const onSubmit = (data: StaffFormValues) => {
    startSubmitting(async () => {
      try {
        if (editingItem) {
          await updateStaffMember(editingItem.id, data);
          toast({ title: "Equipe Atualizada!", description: "Os dados do membro da equipe foram atualizados." });
        } else {
          await addStaffMember(data);
          toast({ title: "Membro Adicionado!", description: "O novo membro foi adicionado à equipe." });
        }
        setIsModalOpen(false);
      } catch (error) {
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível salvar o membro da equipe." });
      }
    });
  }
  
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    startSubmitting(async () => {
      try {
        await deleteStaffMember(itemToDelete.id);
        toast({ title: "Membro Removido!", description: `${itemToDelete.name} foi removido da equipe.` });
        setIsDeleteAlertOpen(false);
        setItemToDelete(null);
      } catch(error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível remover o membro.' });
      }
    });
  }

  const openDeleteDialog = (item: StaffMember) => {
    setItemToDelete(item);
    setIsDeleteAlertOpen(true);
  }

  const TableSkeleton = () => (
     <Table>
        <TableHeader>
            <TableRow>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Skeleton className="h-8 w-20" />
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
            <ClipboardUser className="w-8 h-8" />
            Gestão de Equipe
          </h1>
          <p className="text-muted-foreground">
            Adicione, edite e gerencie os horários da sua equipe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => handleOpenModal()}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Adicionar Membro
            </span>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os profissionais da clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : staff.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={member.isActive ? 'default' : 'secondary'}>
                          {member.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(member)}>Editar</Button>
                        <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(member)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
                <ClipboardUser className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum membro na equipe</h3>
                <p className="mt-2 text-sm text-muted-foreground">Comece adicionando os profissionais da sua clínica para gerenciar os horários.</p>
                <Button className="mt-6" onClick={() => handleOpenModal()}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Membro da Equipe
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Membro da Equipe' : 'Adicionar Novo Membro'}</DialogTitle>
            <DialogDescription>Preencha os detalhes e a disponibilidade do profissional.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                 <FormField control={form.control} name="name" render={({field}) => (
                    <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                 )} />
                 <FormField control={form.control} name="role" render={({field}) => (
                    <FormItem><FormLabel>Cargo</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Veterinário">Veterinário</SelectItem><SelectItem value="Recepcionista">Recepcionista</SelectItem><SelectItem value="Assistente">Assistente</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                 )} />
              </div>
               <FormField control={form.control} name="isActive" render={({field}) => (
                    <FormItem className='flex flex-row items-center justify-start rounded-lg border p-3 shadow-sm gap-4'><FormLabel>Status</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><span className='text-sm text-muted-foreground'>{field.value ? "Ativo" : "Inativo"}</span></FormItem>
               )} />

              <Separator />
              <h3 className='font-semibold'>Horários de Trabalho</h3>

               <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                 {fields.map((day, index) => {
                    const BreaksArray = ({ nestIndex }: { nestIndex: number }) => {
                        const { fields, remove, append } = useFieldArray({
                            control: form.control,
                            name: `availability.${nestIndex}.breaks`
                        });

                        return (
                            <div className='space-y-2 pl-6'>
                                {fields.map((item, k) => (
                                    <div key={item.id} className='flex items-center gap-2'>
                                        <FormField control={form.control} name={`availability.${nestIndex}.breaks.${k}.start`} render={({field}) => (<Input type="time" {...field} className='h-8' />)} />
                                        <span>-</span>
                                        <FormField control={form.control} name={`availability.${nestIndex}.breaks.${k}.end`} render={({field}) => (<Input type="time" {...field} className='h-8' />)} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(k)}><X className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ start: "14:00", end: "14:15" })}>
                                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Intervalo
                                </Button>
                            </div>
                        );
                    };

                    return (
                        <div key={day.id} className='p-3 rounded-md border bg-muted/50 space-y-3'>
                            <FormField control={form.control} name={`availability.${index}.isEnabled`} render={({field}) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel className="font-bold">{dayNames[day.dayOfWeek]}</FormLabel>
                                </FormItem>
                            )} />
                           {form.watch(`availability.${index}.isEnabled`) && (
                             <div className='grid grid-cols-2 gap-4 items-end'>
                                <FormField control={form.control} name={`availability.${index}.startTime`} render={({field}) => (
                                    <FormItem><FormLabel className='text-xs'>Início</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name={`availability.${index}.endTime`} render={({field}) => (
                                    <FormItem><FormLabel className='text-xs'>Fim</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
                                )} />
                                <div className='col-span-2'>
                                    <FormLabel className='text-xs'>Intervalos</FormLabel>
                                    <BreaksArray nestIndex={index} />
                                </div>
                             </div>
                           )}
                        </div>
                    )
                 })}
               </div>

              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
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
                      Esta ação não pode ser desfeita. Isso removerá permanentemente o membro <span className='font-bold'>{itemToDelete?.name}</span> da sua equipe.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sim, remover membro
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
