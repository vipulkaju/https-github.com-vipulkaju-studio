'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, UserPlus } from 'lucide-react';
import { useMachines } from '@/context/machines-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const karigarFormSchema = z.object({
  name: z.string().min(1, 'Karigar name is required.'),
});

type KarigarFormValues = z.infer<typeof karigarFormSchema>;

export function KarigarManagementForm() {
  const { karigars, addKarigar, deleteKarigar } = useMachines();
  const { toast } = useToast();

  const form = useForm<KarigarFormValues>({
    resolver: zodResolver(karigarFormSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = (values: KarigarFormValues) => {
    const trimmedName = values.name.trim();
    if (karigars.some(k => k.name.toLowerCase() === trimmedName.toLowerCase())) {
      form.setError('name', {
        type: 'manual',
        message: 'A karigar with this name already exists.',
      });
      return;
    }
    
    addKarigar(trimmedName);
    toast({
      title: 'Karigar Added',
      description: `Successfully added ${trimmedName}.`,
    });
    form.reset();
  };

  const handleDeleteKarigar = (karigarId: string, karigarName: string) => {
    deleteKarigar(karigarId);
    toast({
      variant: 'destructive',
      title: 'Karigar Deleted',
      description: `Successfully deleted ${karigarName}. They can no longer be selected for new entries.`,
    });
  };

  const inputStyles = 'bg-background/80 backdrop-blur-sm';

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold font-headline tracking-tight">Manage Karigars</CardTitle>
        <CardDescription className="text-base">
          Add new karigars or remove existing ones. Deleting a karigar will not affect past production entries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4 mb-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">Karigar Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter new karigar name" {...field} className="glass-input h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <UserPlus className="mr-2 h-5 w-5" />
              Add Karigar
            </Button>
          </form>
        </Form>
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">Existing Karigars ({karigars.length})</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent mx-4" />
        </div>
        
        <ScrollArea className="h-[450px] -mr-4 pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {karigars.length > 0 ? (
                karigars.sort((a,b) => a.name.localeCompare(b.name)).map(karigar => (
                    <div key={karigar.id} className="flex flex-col items-center justify-center rounded-[2rem] border border-white/20 p-8 bg-white/10 backdrop-blur-md group hover:bg-white/20 transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-110" />
                        
                        <Avatar className="h-20 w-20 border-4 border-white/50 shadow-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                            <AvatarFallback className="bg-primary/20 text-primary font-black text-2xl">{karigar.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        
                        <div className="text-center mb-6">
                            <span className="font-black text-xl tracking-tight block text-foreground font-headline">{karigar.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Karigar</span>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="glass" size="sm" className="rounded-full text-destructive hover:bg-destructive/10 px-4 font-bold">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="liquid-glass border-white/20 p-8 rounded-[3rem]">
                                <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-bold font-headline">Delete Karigar?</AlertDialogTitle>
                                <AlertDialogDescription className="text-base">
                                    This will permanently delete the karigar <span className="font-bold text-foreground">&quot;{karigar.name}&quot;</span>. They can no longer be selected for new entries, but their past records will remain.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                                    onClick={() => handleDeleteKarigar(karigar.id, karigar.name)}
                                >
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center text-muted-foreground py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/20">
                    <div className="bg-white/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <UserPlus className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-xl font-bold text-foreground font-headline mb-2">No Karigars Found</p>
                    <p className="text-sm max-w-[250px] mx-auto">Add your first karigar using the form above to start tracking production.</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
