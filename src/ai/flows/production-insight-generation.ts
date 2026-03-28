'use server';
/**
 * @fileOverview An AI agent for analyzing machine production data to identify bottlenecks, suggest improvements, and flag anomalies.
 *
 * - productionInsightGeneration - A function that handles the generation of production insights.
 * - ProductionInsightGenerationInput - The input type for the productionInsightGeneration function.
 * - ProductionInsightGenerationOutput - The return type for the productionInsightGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductionRecordSchema = z.object({
  date: z.string().describe('The date of the production record (e.g., YYYY-MM-DD).'),
  outputUnits: z.number().describe('Number of units produced.'),
  downtimeMinutes: z.number().describe('Total minutes of downtime.'),
  qualityIssues: z.number().describe('Number of quality control issues detected.'),
  notes: z.string().optional().describe('Any additional notes or observations for the day.'),
});

const ProductionInsightGenerationInputSchema = z.object({
  machineId: z.string().describe('The unique identifier of the machine.'),
  machineModel: z.string().describe('The model of the machine.'),
  capacityUnitsPerHour: z.number().describe('The maximum production capacity of the machine in units per hour.'),
  productionRecords: z.array(ProductionRecordSchema).describe('An array of daily production records for the machine.'),
});
export type ProductionInsightGenerationInput = z.infer<typeof ProductionInsightGenerationInputSchema>;

const AnomalySchema = z.object({
  type: z.string().describe('The type of anomaly (e.g., "Low Output", "High Downtime", "Increased Quality Issues").'),
  date: z.string().describe('The date when the anomaly was observed (e.g., YYYY-MM-DD).'),
  description: z.string().describe('A detailed description of the anomaly and its potential impact.'),
});

const ProductionInsightGenerationOutputSchema = z.object({
  overallSummary: z.string().describe('A concise overall summary of the machine\'s performance based on the provided data.'),
  identifiedBottlenecks: z.array(z.string()).describe('A list of potential bottlenecks identified from the data.'),
  suggestedImprovements: z.array(z.string()).describe('A list of actionable suggestions for improving efficiency and performance.'),
  anomaliesDetected: z.array(AnomalySchema).describe('A list of detected anomalies in machine performance.'),
  keyMetrics: z.object({
    averageDailyOutput: z.number().optional().describe('Average daily output in units.'),
    totalDowntime: z.number().optional().describe('Total downtime in minutes over the period.'),
    averageQualityIssues: z.number().optional().describe('Average daily quality issues.'),
    utilizationRate: z.number().optional().describe('Average utilization rate as a percentage of capacity.'),
  }).optional().describe('Key performance metrics calculated from the data.'),
});
export type ProductionInsightGenerationOutput = z.infer<typeof ProductionInsightGenerationOutputSchema>;

export async function productionInsightGeneration(input: ProductionInsightGenerationInput): Promise<ProductionInsightGenerationOutput> {
  return productionInsightGenerationFlow(input);
}

const productionInsightPrompt = ai.definePrompt({
  name: 'productionInsightPrompt',
  input: {schema: ProductionInsightGenerationInputSchema},
  output: {schema: ProductionInsightGenerationOutputSchema},
  prompt: `You are an AI production expert. Your task is to analyze the provided machine production data.

Machine Details:
- ID: {{{machineId}}}
- Model: {{{machineModel}}}
- Capacity: {{{capacityUnitsPerHour}}} units per hour

Production Records:
{{#each productionRecords}}
  - Date: {{{date}}}, Output: {{{outputUnits}}} units, Downtime: {{{downtimeMinutes}}} min, Quality Issues: {{{qualityIssues}}}{{#if notes}}, Notes: {{{notes}}}{{/if}}
{{/each}}

Analyze the data to:
1. Provide an overall summary of the machine's performance.
2. Identify any potential bottlenecks or inefficiencies.
3. Suggest actionable improvements for operational efficiency, quality, or uptime.
4. Detect and describe any significant anomalies (e.g., unusually low output, high downtime, increased quality issues) including the date they occurred.
5. Calculate and provide key performance metrics where possible.

Ensure your output strictly adheres to the specified JSON schema.`,
});

const productionInsightGenerationFlow = ai.defineFlow(
  {
    name: 'productionInsightGenerationFlow',
    inputSchema: ProductionInsightGenerationInputSchema,
    outputSchema: ProductionInsightGenerationOutputSchema,
  },
  async (input) => {
    const {output} = await productionInsightPrompt(input);
    if (!output) {
      throw new Error('Failed to generate production insights.');
    }
    return output;
  },
);
