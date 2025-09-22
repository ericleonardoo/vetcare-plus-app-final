/**
 * @fileoverview Este arquivo é o ponto de entrada para a integração de API do Genkit com Next.js.
 * Ele expõe os fluxos de IA como endpoints de API, permitindo que o UI do Genkit (genkit dev)
 * os inspecione e execute.
 */
import '@/lib/genkit.config'; // Importa a configuração central para garantir que o Genkit seja inicializado
import { genkit } from '@genkit-ai/next';

// Importa todos os fluxos que queremos expor
import { suggestAppointmentTimesFlow } from '@/ai/flows/suggest-appointment-times';
import { chatFlow } from '@/ai/flows/chat';
import { generateCarePlanFlow } from '@/ai/flows/generate-care-plan';
import { scheduleHumanFollowUpFlow } from '@/ai/tools/clinic-tools';

export const { GET, POST } = genkit({
  // A configuração de plugins e modelo foi movida para o arquivo central genkit.config.ts
  // Aqui, apenas listamos os fluxos que queremos que a UI do Genkit possa ver e usar.
  flows: [
      suggestAppointmentTimesFlow,
      chatFlow,
      generateCarePlanFlow,
      scheduleHumanFollowUpFlow
  ],
});
