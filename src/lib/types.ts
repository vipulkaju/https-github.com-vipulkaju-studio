export type MachineStatus = 'running' | 'idle' | 'fault';

export type ProductionRecord = {
  date: string; // YYYY-MM-DD
  outputUnits: number;
  downtimeMinutes: number;
  qualityIssues: number;
  notes?: string;
};

export type ProductionEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  shift: 'day' | 'night';
  machineId: string;
  karigarName: string;
  designName: string;
  designTich: number;
  totalTich: number;
  frame: number;
  totalMeter: number;
};

export type Machine = {
  id: string;
  model: number;
  capacityUnitsPerHour: number;
  status: MachineStatus;
  currentDesign?: string;
  productionRecords: ProductionRecord[];
  productionEntries: ProductionEntry[];
};

export type Karigar = {
  id: string;
  name: string;
};
