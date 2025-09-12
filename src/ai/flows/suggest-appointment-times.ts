'use server';

/**
 * @fileOverview Suggests optimal appointment times based on staff availability, service type, and time zone.
 *
 * - suggestAppointmentTimes - A function that suggests appointment times.
 * - SuggestAppointmentTimesInput - The input type for the suggestAppointmentTimes function.
 * - SuggestAppointmentTimesOutput - The return type for the suggestAppointmentTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAppointmentTimesInputSchema = z.object({
  serviceType: z.string().describe('The type of service requested (e.g., vaccination, checkup).'),
  staffAvailability: z.string().describe('A JSON string representing the staff availability schedule.'),
  timeZone: z.string().describe('The time zone of the user (e.g., America/Los_Angeles).'),
  durationMinutes: z.number().describe('The duration of the appointment in minutes.'),
  numberOfSuggestions: z.number().describe('The number of appointment time suggestions to provide.'),
});
export type SuggestAppointmentTimesInput = z.infer<typeof SuggestAppointmentTimesInputSchema>;

const SuggestAppointmentTimesOutputSchema = z.object({
  suggestedAppointmentTimes: z.array(
    z.string().describe('An array of suggested appointment times in ISO 8601 format.')
  ).describe('The suggested appointment times based on the inputs.'),
});
export type SuggestAppointmentTimesOutput = z.infer<typeof SuggestAppointmentTimesOutputSchema>;

export async function suggestAppointmentTimes(input: SuggestAppointmentTimesInput): Promise<SuggestAppointmentTimesOutput> {
  return suggestAppointmentTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAppointmentTimesPrompt',
  input: {schema: SuggestAppointmentTimesInputSchema},
  output: {schema: SuggestAppointmentTimesOutputSchema},
  prompt: `You are an AI assistant helping to schedule vet appointments. Given the following information, suggest {{numberOfSuggestions}} optimal appointment times in ISO 8601 format. Take into account the user's time zone.

Service Type: {{{serviceType}}}
Staff Availability: {{{staffAvailability}}}
Time Zone: {{{timeZone}}}
Appointment Duration: {{{durationMinutes}}} minutes.

Output the suggested appointment times in a JSON array. Be sure to format the output as an array of ISO 8601 date strings.
`, // Ensure the array is the output
});

const suggestAppointmentTimesFlow = ai.defineFlow(
  {
    name: 'suggestAppointmentTimesFlow',
    inputSchema: SuggestAppointmentTimesInputSchema,
    outputSchema: SuggestAppointmentTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
