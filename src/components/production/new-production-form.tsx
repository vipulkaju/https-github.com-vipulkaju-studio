'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  CalendarIcon, Zap, User, 
  ChevronRight, ChevronLeft, Target, Ruler,
  Layers, Cpu
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { motion, AnimatePresence } from 'motion/react';

// Form validation schema
const productionEntrySchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  shift: z.enum(['day', 'night'], { required_error: 'Shift is required' }),
  machineId: z.string({ required_error: 'Machine is required' }),
  karigarName: z.string().min(1, 'Operator name is required'),
  designName: z.string().min(1, 'Design name is required'),
  designTich: z.coerce.number().positive('Enter Tich'),
  totalTich: z.coerce.number().positive('Total Tich required'),
  frame: z.coerce.number().min(0, 'Enter Frame'),
  totalMeter: z.coerce.number(),
});

type ProductionEntryFormValues = z.infer<typeof productionEntrySchema>;

interface Machine {
  id: string;
  model: number;
  capacityUnitsPerHour: number;
}

interface Karigar {
  id: string;
  name: string;
}

interface NewProductionFormProps {
  machines: Machine[];
  karigars: Karigar[];
  onAddEntry: (entry: ProductionEntryFormValues) => void;
}

export function NewProductionForm({ machines, karigars, onAddEntry }: NewProductionFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<ProductionEntryFormValues>({
    resolver: zodResolver(productionEntrySchema),
    defaultValues: {
      date: new Date(),
      shift: 'day',
      machineId: '',
      karigarName: '',
      designName: '',
      designTich: 0,
      totalTich: 0,
      frame: 0,
      totalMeter: 0,
    },
  });

  const watchedValues = form.watch();

  // Automatic Calculation Logic
  useEffect(() => {
    const machine = machines.find((m) => m.id === watchedValues.machineId);
    if (machine && watchedValues.frame > 0) {
      const meter = (machine.model * machine.capacityUnitsPerHour / 1000) * watchedValues.frame;
      form.setValue('totalMeter', parseFloat(meter.toFixed(2)));
    }
    if (watchedValues.designTich > 0 && watchedValues.frame > 0) {
      form.setValue('totalTich', watchedValues.designTich * watchedValues.frame);
    }
  }, [watchedValues.machineId, watchedValues.frame, watchedValues.designTich, machines, form]);

  const nextStep = async () => {
    const stepFields = [
      ['date', 'shift'], 
      ['machineId', 'karigarName'], 
      ['designName', 'designTich', 'frame']
    ] as const;
    
    const isValid = await form.trigger(stepFields[currentStep] as (keyof ProductionEntryFormValues)[]);
    if (isValid) setCurrentStep(s => s + 1);
  };

  const onSubmit = (data: ProductionEntryFormValues) => {
    onAddEntry(data);
    toast({ title: "Success!", description: "Entry saved successfully." });
    setCurrentStep(0);
    form.reset();
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 p-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <motion.div 
              initial={false}
              animate={{ 
                backgroundColor: currentStep >= i ? '#f97316' : '#e2e8f0',
                scale: currentStep === i ? 1.2 : 1 
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
            >
              {i + 1}
            </motion.div>
            {i < 2 && (
              <div className={cn(
                "h-1 flex-1 mx-2 rounded-full transition-colors duration-500",
                currentStep > i ? "bg-orange-500" : "bg-slate-200"
              )} />
            )}
          </div>
        ))}
      </div>

      <Card className="border-none bg-white dark:bg-slate-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* STEP 1: TIME & SHIFT */}
                  {currentStep === 0 && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Shift Details</h2>
                        <p className="text-slate-500">Select the date and production shift.</p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-500">Production Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="h-14 rounded-2xl border-slate-200 font-medium text-lg bg-slate-50/50 justify-start px-5 hover:bg-white transition-all">
                                  <CalendarIcon className="mr-3 h-5 w-5 text-orange-500" />
                                  {field.value ? format(field.value, 'PPP') : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="rounded-3xl p-0 shadow-2xl border-none" align="center">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shift"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-500">Working Shift</FormLabel>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                              <Label className={cn(
                                "flex items-center gap-3 px-6 h-20 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                                field.value === 'day' ? "bg-orange-50 border-orange-500 text-orange-700 shadow-md shadow-orange-100" : "border-slate-100 bg-slate-50/50 text-slate-400 hover:bg-white"
                              )}>
                                <RadioGroupItem value="day" className="sr-only" />
                                <span className="text-2xl">☀️</span>
                                <span className="font-bold text-lg">Day Shift</span>
                              </Label>
                              <Label className={cn(
                                "flex items-center gap-3 px-6 h-20 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                                field.value === 'night' ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md shadow-indigo-100" : "border-slate-100 bg-slate-50/50 text-slate-400 hover:bg-white"
                              )}>
                                <RadioGroupItem value="night" className="sr-only" />
                                <span className="text-2xl">🌙</span>
                                <span className="font-bold text-lg">Night Shift</span>
                              </Label>
                            </RadioGroup>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* STEP 2: MACHINE & OPERATOR */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Operator Details</h2>
                        <p className="text-slate-500">Assign machine and karigar.</p>
                      </div>
                      
                      <div className="grid gap-6">
                        <FormField
                          control={form.control}
                          name="machineId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-500">Machine ID</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold text-lg">
                                  <div className="flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-orange-500" />
                                    <SelectValue placeholder="Select Machine" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                  {machines.length > 0 ? (
                                    machines.map((m) => <SelectItem key={m.id} value={m.id}>Machine {m.id}</SelectItem>)
                                  ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                      No machines found. Please add one in Machines page.
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="karigarName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-500">Operator Name</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold text-lg">
                                  <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange-500" />
                                    <SelectValue placeholder="Select Operator" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                  {karigars.length > 0 ? (
                                    karigars.map((k) => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)
                                  ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                      No operators found. Please add one in Settings.
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                      </div>
                    </div>
                  )}

                  {/* STEP 3: PRODUCTION DATA */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Production Data</h2>
                        <p className="text-slate-500">Enter design and frame counts.</p>
                      </div>

                      <FormField control={form.control} name="designName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold uppercase tracking-wider text-slate-500">Design Name</FormLabel>
                          <div className="relative group">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input {...field} placeholder="e.g. Flower Pattern" className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-lg" />
                          </div>
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="designTich" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-400 ml-1">Design Tich</FormLabel>
                            <Input type="number" {...field} className="h-14 rounded-2xl border-slate-200 font-bold text-lg text-center bg-slate-50/50" />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="frame" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-400 ml-1">Frame Count</FormLabel>
                            <Input type="number" {...field} className="h-14 rounded-2xl border-slate-200 font-bold text-lg text-center bg-slate-50/50" />
                          </FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="totalTich" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-400 ml-1">Total Tich (Editable)</FormLabel>
                            <div className="relative group">
                              <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                              <Input type="number" {...field} className="h-14 pl-12 rounded-2xl border-orange-200 bg-orange-50/30 font-bold text-xl text-orange-600 focus-visible:ring-orange-500" />
                            </div>
                          </FormItem>
                        )} />
                        
                        <div className="flex flex-col">
                          <FormLabel className="text-xs font-bold uppercase text-slate-400 ml-1 mb-2">Total Meters</FormLabel>
                          <div className="h-14 p-5 rounded-2xl bg-slate-900 text-white shadow-lg relative overflow-hidden flex items-center">
                            <Ruler className="absolute -right-1 -bottom-1 h-10 w-10 text-white/10 -rotate-12" />
                            <p className="text-xl font-bold tracking-tight">{watchedValues.totalMeter || 0}m</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                {currentStep > 0 && (
                  <Button type="button" variant="ghost" onClick={() => setCurrentStep(s => s - 1)} className="h-16 rounded-2xl font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}
                {currentStep < 2 ? (
                  <Button type="button" onClick={nextStep} className="flex-1 h-16 rounded-3xl font-bold text-lg bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-200 transition-all active:scale-95">
                    Continue <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1 h-16 rounded-3xl font-bold text-lg bg-slate-900 hover:bg-black text-white shadow-2xl transition-all active:scale-95">
                    <Zap className="mr-2 fill-current w-5 h-5" /> Save
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}