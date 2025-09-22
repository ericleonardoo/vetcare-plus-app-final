
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addDays } from 'date-fns';


const SuggestAppointmentTimesInputSchema = z.object({
  serviceType: z.string().describe('The type of service requested (e.g., vaccination, checkup).'),
  timeZone: z.string().describe('The time zone of the user (e.g., America/Los_Angeles).'),
  durationMinutes: z.number().describe('The duration of the appointment in minutes.'),
  numberOfSuggestions: z.number().describe('The number of appointment time suggestions to provide.'),
  date: z.string().describe("A data selecionada pelo usuário no formato ISO 8601 para filtrar as sugestões."),
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
  input: {schema: z.object({
    serviceType: z.string(),
    staffAvailability: z.string(),
    timeZone: z.string(),
    durationMinutes: z.number(),
    numberOfSuggestions: z.number(),
  })},
  output: {schema: SuggestAppointmentTimesOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `Você é um assistente de IA especialista em agendamentos de uma clínica veterinária.
Sua tarefa é sugerir os melhores horários para uma consulta com base nas informações fornecidas.

Leve em consideração o seguinte:
1. A duração do serviço solicitado.
2. A disponibilidade da equipe, que segue um cronograma semanal.
3. Horários específicos que já estão bloqueados/ocupados.
4. O fuso horário do usuário para garantir que os horários sejam convenientes para ele.
5. Se um 'dateRange' for fornecido, sugira horários apenas dentro desse intervalo.

Informações da Solicitação:
- Tipo de Serviço: {{{serviceType}}}
- Disponibilidade da Equipe e Horários Bloqueados: {{{staffAvailability}}}
- Fuso Horário do Usuário: {{{timeZone}}}
- Duração da Consulta: {{{durationMinutes}}} minutos
- Quantidade de Sugestões: {{numberOfSuggestions}}

Sugira exatamente {{numberOfSuggestions}} horários de consulta ideais.
Retorne os horários sugeridos no formato ISO 8601 dentro de um array JSON.
`,
});

export const suggestAppointmentTimesFlow = ai.defineFlow(
  {
    name: 'suggestAppointmentTimesFlow',
    inputSchema: SuggestAppointmentTimesInputSchema,
    outputSchema: SuggestAppointmentTimesOutputSchema,
  },
  async input => {
    
    // O fluxo de IA agora busca os dados diretamente do Firestore
    const staffSnapshot = await getDocs(collection(db, "staff"));
    const availabilityData = staffSnapshot.docs.map(doc => doc.data());
    
    const availabilityMap: Record<string, any[]> = {};
    availabilityData.forEach(staff => {
        staff.availability.forEach((day: any) => {
            if (day.isEnabled) {
                const dayName = day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1);
                if (!availabilityMap[dayName]) {
                    availabilityMap[dayName] = [];
                }
                availabilityMap[dayName].push(`${day.startTime}-${day.endTime}`);
            }
        });
    });

    const appointmentsSnapshot = await getDocs(collection(db, "appointments"));
    const blockedTimes = appointmentsSnapshot.docs.map(doc => doc.data().date);

    const availabilityWithBlockedTimes = {
      ...availabilityMap,
      blocked: blockedTimes,
      dateRange: {
        start: new Date(input.date).toISOString(),
        end: addDays(new Date(input.date), 1).toISOString()
      }
    };
    
    const promptInput = {
      ...input,
      staffAvailability: JSON.stringify(availabilityWithBlockedTimes)
    };
    
    const {output} = await prompt(promptInput);
    return output!;
  }
);
