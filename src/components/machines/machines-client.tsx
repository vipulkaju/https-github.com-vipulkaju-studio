'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Cpu, Activity, Settings2, Hash, Palette, Save, Calculator } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import type { Machine } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AnimatedCounter } from '@/components/animated-counter';
import { useMachines } from '@/context/machines-context';

const machineFormSchema = z.object({
  id: z.string().min(1, 'Machine ID is required'),
  model: z.coerce.number().min(1, 'Machine model must be a positive number'),
  capacityUnitsPerHour: z.coerce.number().min(1, 'Capacity must be at least 1'),
  currentDesign: z.string().optional(),
});

type MachineFormValues = z.infer<typeof machineFormSchema>;

export function MachinesClient() {
  const { machines, addMachine, updateMachine, deleteMachine } = useMachines();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const { toast } = useToast();

  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      id: '',
      model: 0,
      capacityUnitsPerHour: 0,
    },
  });

  useEffect(() => {
    if (isFormOpen) {
      if (editingMachine) {
        form.reset({
          id: editingMachine.id,
          model: editingMachine.model,
          capacityUnitsPerHour: editingMachine.capacityUnitsPerHour,
          currentDesign: editingMachine.currentDesign || '',
        });
      } else {
        const machineNumbers = machines
          .map((m) => parseInt(m.id.replace(/^\D+/g, ''), 10))
          .filter((n) => !isNaN(n));
        const nextIdNumber =
          machineNumbers.length > 0 ? Math.max(...machineNumbers) + 1 : 1;
        const nextId = `m${nextIdNumber}`;
        form.reset({
          id: nextId,
          model: 0,
          capacityUnitsPerHour: 10,
          currentDesign: '',
        });
      }
    } else {
      setEditingMachine(null);
      form.reset({
        id: '',
        model: 0,
        capacityUnitsPerHour: 0,
      });
    }
  }, [isFormOpen, editingMachine, machines, form]);

  function onSubmit(data: MachineFormValues) {
    if (editingMachine) {
      updateMachine(data);
      toast({
        title: 'Machine Updated',
        description: `Machine ${data.id} has been updated successfully.`,
      });
    } else {
      if (machines.some(machine => machine.id.toLowerCase() === data.id.toLowerCase())) {
        form.setError('id', {
          type: 'manual',
          message: 'A machine with this ID already exists.',
        });
        return;
      }
      addMachine(data);
      toast({
        title: 'Machine Registered',
        description: `Machine ${data.id} has been added successfully.`,
      });
    }
    setFormOpen(false);
  }

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormOpen(true);
  };

  const handleDelete = (machineId: string) => {
    deleteMachine(machineId);
    toast({
      title: 'Machine Deleted',
      description: `Machine ${machineId} has been removed.`,
      variant: 'destructive',
    });
  };

  const watchedModel = form.watch('model');
  const watchedCapacity = form.watch('capacityUnitsPerHour');

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Machines" subtitle="Manage your production equipment">
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMachine(null)} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <PlusCircle className="mr-2 h-5 w-5" />
              Register Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="liquid-glass border-white/20 p-0 rounded-[3rem] sm:max-w-[550px] overflow-hidden">
            <div className="bg-primary/10 p-8 pb-6 border-b border-white/10 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <DialogHeader>
                <DialogTitle className="text-3xl font-black font-headline tracking-tight flex items-center gap-3">
                  <Cpu className="h-8 w-8 text-primary" />
                  {editingMachine ? 'Edit Machine' : 'Register Machine'}
                </DialogTitle>
                <DialogDescription className="text-base font-medium opacity-80">
                  {editingMachine
                    ? `Update technical specifications for ${editingMachine.id.toUpperCase()}.`
                    : 'Deploy a new machine to your production line.'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-8 space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <Hash className="h-3 w-3" /> Machine ID
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., m1" {...field} disabled={!!editingMachine} className="glass-input h-12 font-mono text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <Settings2 className="h-3 w-3" /> Machine Had
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 200"
                            {...field}
                            className="glass-input h-12 font-mono text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="capacityUnitsPerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <Activity className="h-3 w-3" /> Machines Areo
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="glass-input h-12 font-mono text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentDesign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <Palette className="h-3 w-3" /> Current Design
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Haji Sari" {...field} className="glass-input h-12 font-semibold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-black/5 dark:bg-white/5 p-5 rounded-[2rem] border border-white/10 flex items-center justify-between mt-8">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-[10px] font-black text-primary/80 uppercase tracking-[0.15em]">
                      <Calculator className="h-3 w-3" /> Production Capacity
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">1 Frem Meters</span>
                  </div>
                  <div className="font-mono text-3xl font-black text-primary tracking-tighter bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 shadow-inner">
                    {((watchedModel || 0) * (watchedCapacity || 0)) / 1000}
                    <span className="text-sm ml-1 font-sans font-bold opacity-60">m</span>
                  </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-0 pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="rounded-xl h-12 px-6 font-bold hover:bg-black/5 dark:hover:bg-white/10">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="rounded-xl h-12 px-8 font-bold text-base shadow-lg hover:shadow-primary/25 transition-all">
                    <Save className="mr-2 h-5 w-5" />
                    {editingMachine ? 'Save Changes' : 'Deploy Machine'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {machines.map((machine) => (
          <div key={machine.id} className="glass-card p-0 group relative overflow-hidden flex flex-col border-white/10 shadow-2xl hover:shadow-primary/5 transition-all duration-500">
            {/* Top Header Section with Status */}
            <div className="p-6 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:bg-primary/20 transition-colors duration-500">
                  <Cpu className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-xl font-headline tracking-tight">M-{machine.id.toUpperCase()}</h3>
                    <div className={cn(
                      "h-2 w-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]",
                      machine.status === 'running' ? "bg-emerald-500 shadow-emerald-500/50" : "bg-amber-500 shadow-amber-500/50"
                    )} />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    {machine.currentDesign ? (
                      <span className="text-primary/80">Design: {machine.currentDesign}</span>
                    ) : (
                      "No Active Design"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <Button
                  variant="glass"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-primary/10"
                  onClick={() => handleEdit(machine)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="glass"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="liquid-glass border-white/20 p-8 rounded-[3rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-bold font-headline">Delete Machine?</AlertDialogTitle>
                      <AlertDialogDescription className="text-base">
                        This will permanently remove machine <span className="font-bold text-foreground">{machine.id}</span> from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                        onClick={() => handleDelete(machine.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Technical Specs Section */}
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Settings2 className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Machine Had</span>
                </div>
                <div className="font-mono text-2xl font-bold tracking-tighter">
                  <AnimatedCounter value={machine.model} />
                </div>
              </div>
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Machines Areo</span>
                </div>
                <div className="font-mono text-2xl font-bold tracking-tighter">
                  <AnimatedCounter value={machine.capacityUnitsPerHour} />
                </div>
              </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="mt-auto p-6 pt-2">
              <div className="bg-primary/5 p-5 rounded-[2rem] border border-primary/10 flex items-center justify-between group-hover:bg-primary/10 transition-colors duration-500">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.15em] mb-1">Production Capacity</span>
                  <span className="text-xs font-bold text-muted-foreground">1 Frem Meters</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-black text-3xl text-primary font-headline tracking-tighter">
                    {((machine.model * machine.capacityUnitsPerHour) / 1000).toFixed(2)}
                    <span className="text-sm ml-1 font-sans font-bold opacity-60">m</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative Background Element */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
