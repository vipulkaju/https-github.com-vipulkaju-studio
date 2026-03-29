'use client';

import { NewProductionForm } from '@/components/production/new-production-form';
import { useMachines } from '@/context/machines-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NewProductionPage() {
  const { machines, addProductionEntry, addMachine, karigars, addKarigar, allProductionEntries } = useMachines();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-b-[100%] blur-3xl -z-10" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="flex flex-col gap-2 sm:gap-10 max-w-4xl mx-auto py-2 sm:py-12 px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-1 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button asChild variant="outline" size="icon" className="h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-2xl border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-1.5 sm:p-3 bg-primary/20 rounded-lg sm:rounded-2xl shadow-inner border border-primary/10">
                <Sparkles className="h-5 w-5 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h1 className="font-headline text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
                New Entry
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-xs sm:text-xl font-medium sm:ml-[5.5rem] max-w-2xl px-1">
            Record today&apos;s production details accurately.
          </p>
        </div>

        <div className="mt-1 sm:mt-4">
          <NewProductionForm
            machines={machines}
            karigars={karigars}
            onAddEntry={addProductionEntry}
            addMachine={addMachine}
            addKarigar={addKarigar}
            allProductionEntries={allProductionEntries}
          />
        </div>
      </div>
    </div>
  );
}
