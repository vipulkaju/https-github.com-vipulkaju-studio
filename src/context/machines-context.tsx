'use client';

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Machine, ProductionEntry, Karigar } from '@/lib/types';
import { format, startOfDay, endOfDay } from 'date-fns';
import {
  useAuth,
  useFirestore,
  useUser,
  useCollection,
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

// Form data types from the form component
type ProductionEntryFormData = {
  date: Date;
  shift: 'day' | 'night';
  machineId: string;
  karigarName: string;
  designName: string;
  designTich: number;
  totalTich: number;
  frame: number;
  totalMeter: number;
}

export type ProductionEntryUpdateData = {
  date: Date;
  designName: string;
  designTich: number;
  frame: number;
  totalMeter: number;
  totalTich: number;
};

type MachineFormData = {
  id: string;
  model: number;
  capacityUnitsPerHour: number;
  currentDesign?: string;
};

// New type for the context
interface MachinesContextType {
  machines: Machine[];
  karigars: Karigar[];
  allProductionEntries: ProductionEntry[];
  isDataLoading: boolean;
  addProductionEntry: (entry: ProductionEntryFormData) => void;
  updateProductionEntry: (entryId: string, data: ProductionEntryUpdateData) => void;
  addMachine: (machine: MachineFormData) => void;
  updateMachine: (machine: MachineFormData) => void;
  deleteMachine: (machineId: string) => void;
  addKarigar: (name: string) => void;
  deleteKarigar: (karigarId: string) => void;
  deleteProductionEntry: (entryId: string) => void;
  bulkDeleteEntries: (filters: {
    karigarName?: string;
    startDate?: Date;
    endDate?: Date;
  }) => Promise<number>;
}

const MachinesContext = createContext<MachinesContextType | undefined>(undefined);

export function MachinesProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();

  // Firestore collection references are now scoped to the user's UID.
  const machinesColRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'machines') : null, [firestore, user]);
  const karigarsColRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'karigars') : null, [firestore, user]);
  const entriesColRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'productionEntries') : null, [firestore, user]);

  // Fetch collections
  const { data: machinesData, isLoading: machinesLoading } = useCollection<Omit<Machine, 'productionEntries'>>(machinesColRef);
  const { data: karigarsData, isLoading: karigarsLoading } = useCollection<Karigar>(karigarsColRef);
  const { data: entriesData, isLoading: entriesLoading } = useCollection<ProductionEntry>(entriesColRef);

  const isDataLoading = machinesLoading || karigarsLoading || entriesLoading || isAuthLoading;

  // This is used for the auto-selection logic on the new entry form
  const allProductionEntries = useMemo(() => entriesData || [], [entriesData]);

  // Combine machine data with their respective entries for other parts of the app
  const machines = useMemo((): Machine[] => {
    if (!machinesData) return [];
    const entriesByMachine = (entriesData || []).reduce((acc, entry) => {
        if (!acc[entry.machineId]) {
            acc[entry.machineId] = [];
        }
        acc[entry.machineId].push(entry);
        return acc;
    }, {} as Record<string, ProductionEntry[]>);

    return machinesData.map(machine => ({
      ...machine,
      productionEntries: entriesByMachine[machine.id] || [],
      // productionRecords is not in firestore model for now
      productionRecords: [], 
    }));
  }, [machinesData, entriesData]);


  const addProductionEntry = useCallback((entryData: ProductionEntryFormData) => {
    if (!firestore || !user) return;
    const userEntriesColRef = collection(firestore, 'users', user.uid, 'productionEntries');
    const newEntryId = doc(userEntriesColRef).id;
    const newEntry = {
      ...entryData,
      id: newEntryId,
      date: format(entryData.date, 'yyyy-MM-dd'),
      createdAt: new Date(),
    };
    const docRef = doc(userEntriesColRef, newEntryId);
    setDocumentNonBlocking(docRef, newEntry, {});
  }, [firestore, user]);

  const updateProductionEntry = useCallback((entryId: string, data: ProductionEntryUpdateData) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, 'users', user.uid, 'productionEntries', entryId);
    const formattedData = {
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    };
    setDocumentNonBlocking(docRef, formattedData, { merge: true });
  }, [firestore, user]);

  const deleteProductionEntry = useCallback((entryId: string) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, 'users', user.uid, 'productionEntries', entryId);
    deleteDocumentNonBlocking(docRef);
  }, [firestore, user]);

  const bulkDeleteEntries = useCallback(
    async (filters: {
      karigarName?: string;
      startDate?: Date;
      endDate?: Date;
    }): Promise<number> => {
      if (!firestore || !user || !entriesData) return 0;

      let entriesToDelete = [...entriesData];

      if (filters.karigarName) {
        entriesToDelete = entriesToDelete.filter(
          (e) => e.karigarName === filters.karigarName
        );
      }

      if (filters.startDate) {
        const start = startOfDay(filters.startDate);
        entriesToDelete = entriesToDelete.filter(
          (e) => new Date(e.date) >= start
        );
      }

      if (filters.endDate) {
        const end = endOfDay(filters.endDate);
        entriesToDelete = entriesToDelete.filter(
          (e) => new Date(e.date) <= end
        );
      }

      if (entriesToDelete.length === 0) {
        return 0;
      }

      const batch = writeBatch(firestore);
      entriesToDelete.forEach(entry => {
        const docRef = doc(firestore, 'users', user.uid, 'productionEntries', entry.id);
        batch.delete(docRef);
      });
      await batch.commit();

      return entriesToDelete.length;
    },
    [firestore, user, entriesData]
  );

  const addMachine = useCallback((data: MachineFormData) => {
    if (!firestore || !user) return;
    const newMachine: Omit<Machine, 'productionEntries' | 'productionRecords'> = {
      ...data,
      status: 'idle',
      currentDesign: data.currentDesign || '',
    };
    const docRef = doc(firestore, 'users', user.uid, 'machines', data.id);
    setDocumentNonBlocking(docRef, newMachine, {});
  }, [firestore, user]);

  const updateMachine = useCallback((data: MachineFormData) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, 'users', user.uid, 'machines', data.id);
    setDocumentNonBlocking(docRef, { 
      model: data.model, 
      capacityUnitsPerHour: data.capacityUnitsPerHour,
      currentDesign: data.currentDesign || '',
    }, { merge: true });
  }, [firestore, user]);

  const deleteMachine = useCallback(async (machineId: string) => {
    if (!firestore || !user) return;
    const machineDocRef = doc(firestore, 'users', user.uid, 'machines', machineId);
    deleteDocumentNonBlocking(machineDocRef);
    // In a real app, you would also delete associated productionEntries.
  }, [firestore, user]);

  const addKarigar = useCallback((name: string) => {
    if (!firestore || !user) return;
    if (karigarsData?.some(k => k.name.toLowerCase() === name.toLowerCase())) {
        return;
    }
    const userKarigarsColRef = collection(firestore, 'users', user.uid, 'karigars');
    const newKarigarId = doc(userKarigarsColRef).id;
    const newKarigar: Karigar = {
      id: newKarigarId,
      name,
    };
    const docRef = doc(userKarigarsColRef, newKarigarId);
    setDocumentNonBlocking(docRef, newKarigar, {});
  }, [firestore, user, karigarsData]);

  const deleteKarigar = useCallback((karigarId: string) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, 'users', user.uid, 'karigars', karigarId);
    deleteDocumentNonBlocking(docRef);
  }, [firestore, user]);

  const value = {
    machines,
    karigars: karigarsData || [],
    allProductionEntries,
    isDataLoading,
    addProductionEntry,
    updateProductionEntry,
    addMachine,
    updateMachine,
    deleteMachine,
    addKarigar,
    deleteKarigar,
    deleteProductionEntry,
    bulkDeleteEntries,
  };

  return (
    <MachinesContext.Provider value={value}>
      {children}
    </MachinesContext.Provider>
  );
}

export function useMachines() {
  const context = useContext(MachinesContext);
  if (context === undefined) {
    throw new Error('useMachines must be used within a MachinesProvider');
  }
  return context;
}
