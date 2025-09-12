
'use server';
/**
 * @fileOverview Ferramentas de IA para a clínica VetCare+.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ScheduleHumanFollowUpInputSchema = z.object({
  userName: z.string().describe('O nome do usuário que solicita o contato.'),
  userContact: z.string().describe('A informação de contato do usuário (email ou telefone).'),
  reason: z.string().describe('Um breve resumo do motivo pelo qual o usuário precisa de ajuda.'),
});

const ScheduleHumanFollowUpOutputSchema = z.object({
  id: z.number(),
  userName: z.string(),
  userContact: z.string(),
  reason: z.string(),
  timestamp: z.string().describe('O timestamp ISO 8601 de quando a notificação foi criada.'),
});


// Este fluxo atuará como nosso "armazenamento em memória" para notificações.
// Em uma aplicação real, isso seria salvo em um banco de dados (ex: Firestore).
const notifications: (z.infer<typeof ScheduleHumanFollowUpOutputSchema> & { id: number })[] = [];
let notificationId = 0;


export const scheduleHumanFollowUp = ai.defineTool(
  {
    name: 'scheduleHumanFollowUp',
    description: 'Notifica um membro da equipe para entrar em contato com o usuário. Use isso se o usuário estiver em uma emergência ou parecer muito frustrado.',
    inputSchema: ScheduleHumanFollowUpInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    console.log('Ferramenta scheduleHumanFollowUp chamada com:', input);
    
    // Simula o armazenamento da notificação
    notificationId++;
    const newNotification = {
      ...input,
      id: notificationId,
      timestamp: new Date().toISOString(),
    };
    notifications.push(newNotification);

    return `Um atendente humano foi notificado. Ele entrará em contato com ${input.userName} em ${input.userContact} em breve.`;
  }
);


// Fluxo de wrapper para ser chamado a partir de uma Ação de Servidor
export const scheduleHumanFollowUpFlow = ai.defineFlow(
  {
    name: 'scheduleHumanFollowUpFlow',
    inputSchema: ScheduleHumanFollowUpInputSchema,
    outputSchema: ScheduleHumanFollowUpOutputSchema,
  },
  async (input) => {
    console.log('Fluxo scheduleHumanFollowUpFlow chamado com:', input);
    notificationId++;
    const newNotification = {
      ...input,
      id: notificationId,
      timestamp: new Date().toISOString(),
    };
    notifications.push(newNotification);
    return newNotification;
  }
);
