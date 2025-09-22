
'use server';
/**
 * @fileOverview Ferramentas de IA para a clínica VetCare+.
 */
import '@/lib/genkit.config'; // Garante que o Genkit seja configurado!
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ScheduleHumanFollowUpInputSchema = z.object({
  reason: z.string().describe('Um breve resumo do motivo pelo qual o usuário precisa de ajuda.'),
});

// Este esquema é usado internamente pelo fluxo e não precisa ser exportado
const InternalFollowUpSchema = z.object({
  id: z.number(),
  userName: z.string(),
  userContact: z.string(),
  reason: z.string(),
  timestamp: z.string().describe('O timestamp ISO 8601 de quando a notificação foi criada.'),
});


// Este fluxo atuará como nosso "armazenamento em memória" para notificações.
// Em uma aplicação real, isso seria salvo em um banco de dados (ex: Firestore).
const notifications: (z.infer<typeof InternalFollowUpSchema>)[] = [];
let notificationId = 0;


export const scheduleHumanFollowUp = ai.defineTool(
  {
    name: 'scheduleHumanFollowUp',
    description: 'Notifica um membro da equipe para entrar em contato com o usuário. Use isso se o usuário estiver em uma emergência ou parecer muito frustrado.',
    inputSchema: ScheduleHumanFollowUpInputSchema,
    outputSchema: z.string(),
  },
  // A função da ferramenta agora pode receber o contexto opcional da chamada
  async (input, context) => {
    const { userName, userContact } = context || {};

    if (!userName || !userContact) {
        return "Não foi possível identificar o usuário. Por favor, peça ao usuário para fornecer seu nome e contato.";
    }

    console.log('Ferramenta scheduleHumanFollowUp chamada para:', { ...input, userName, userContact });
    
    // Simula o armazenamento da notificação
    notificationId++;
    const newNotification = {
      ...input,
      userName,
      userContact,
      id: notificationId,
      timestamp: new Date().toISOString(),
    };
    notifications.push(newNotification);

    return `Um atendente humano foi notificado. Eles entrarão em contato com ${userName} em ${userContact} em breve.`;
  }
);


// Fluxo de wrapper para ser chamado a partir de uma Ação de Servidor
// Este fluxo é necessário para que a UI possa acionar a ferramenta diretamente, se necessário
export const scheduleHumanFollowUpFlow = ai.defineFlow(
  {
    name: 'scheduleHumanFollowUpFlow',
    inputSchema: z.object({
      userName: z.string(),
      userContact: z.string(),
      reason: z.string(),
    }),
    outputSchema: InternalFollowUpSchema,
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

// Função para obter as notificações (para o dashboard profissional)
export async function getNotifications() {
    return notifications;
}

// Função para limpar as notificações
export async function clearAllNotifications() {
    notifications.length = 0; // Esvazia o array
}
