"use server";

import {
  productionInsightGeneration,
  type ProductionInsightGenerationInput,
  type ProductionInsightGenerationOutput,
} from '@/ai/flows/production-insight-generation';
import type { Machine } from '@/lib/types';

export async function getProductionInsights(
  machine: Machine
): Promise<{ success: true; data: ProductionInsightGenerationOutput } | { success: false; error: string }> {
  try {
    if (!machine.productionRecords || machine.productionRecords.length === 0) {
      return { success: false, error: 'No production records available to analyze.' };
    }

    const input: ProductionInsightGenerationInput = {
      machineId: machine.id,
      machineModel: machine.model.toString(),
      capacityUnitsPerHour: machine.capacityUnitsPerHour,
      productionRecords: machine.productionRecords,
    };

    const insights = await productionInsightGeneration(input);
    return { success: true, data: insights };
  } catch (error) {
    console.error('Error generating production insights:', error);
    return { success: false, error: 'Failed to generate insights. Please try again later.' };
  }
}
