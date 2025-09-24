
/**
 * @fileoverview Este arquivo é o ponto de entrada para a integração de API do Genkit com Next.js.
 * Ele expõe os fluxos de IA como endpoints de API, permitindo que o UI do Genkit (genkit dev)
 * os inspecione e execute.
 */
import { createApiHandler } from '@genkit-ai/next';

// Importa todos os fluxos que queremos expor
import { suggestAppointmentTimesFlow } from '@/ai/flows/suggest-appointment-times';
import { chatFlow } from '@/ai/flows/chat';
import { generateCarePlanFlow } from '@/ai/flows/generate-care-plan';
import { scheduleHumanFollowUpFlow } from '@/ai/tools/clinic-tools';

// Exporta os manipuladores de rota do Genkit, passando os fluxos a serem expostos.
export const { GET, POST } = createApiHandler({
  flows: [
    suggestAppointmentTimesFlow,
    chatFlow,
    generateCarePlanFlow,
    scheduleHumanFollowUpFlow,
  ],
});
