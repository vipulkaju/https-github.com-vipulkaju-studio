import { MachinesClient } from '@/components/machines/machines-client';

export default function MachinesPage() {
  // Data is now managed by MachinesProvider context
  return <MachinesClient />;
}
