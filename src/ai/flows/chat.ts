'use server';

/**
 * @fileOverview Um agente de chat de IA para a clínica VetCare+.
 *
 * - chat - Uma função que lida com a conversa do chat.
 * - ChatInput - O tipo de entrada para a função de chat.
 * - ChatOutput - O tipo de retorno para a função de chat.
 */

import { ai } from '@/ai/genkit';
import { scheduleHumanFollowUp } from '@/ai/tools/clinic-tools';
import { z } from 'genkit';
import { Message, Part, ToolRequestPart, renderToolResponse, toolRequest, } from 'genkit';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  userId: z.string().optional().describe("ID do usuário logado para buscar o nome e contato."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: z.object({ 
      history: z.array(z.any()),
      userName: z.string().optional(),
      userContact: z.string().optional(),
   }) },
  output: { format: 'text' },
  tools: [scheduleHumanFollowUp],
  prompt: `Você é "Dr. Gato", um assistente de IA amigável e prestativo da clínica veterinária VetCare+.
Seu trabalho é responder a perguntas sobre a clínica, seus serviços, agendamentos e fornecer conselhos gerais sobre cuidados com animais de estimação.
Seja sempre educado, empático e profissional.

{{#if userName}}
O usuário com quem você está conversando se chama {{userName}}. Use o nome dele para personalizar a conversa.
{{/if}}

Use as informações da clínica, se necessário:
- Nome da Clínica: VetCare+
- Endereço: Rua dos Pets, 123, Cidade Animal, 12345-678
- Telefone: (11) 98765-4321
- Email: contato@vetcareplus.com.br
- Horário de Funcionamento: Seg-Sex 9:00-17:00, Sáb 10:00-14:00. Fechado aos domingos.
- Serviços: Check-ups, vacinação, cuidado dental, cirurgias, banho e tosa, atendimento de emergência (durante o horário de funcionamento).

**Instruções para Ferramentas:**
- Se o usuário estiver descrevendo uma emergência médica clara e grave, ou parecer muito frustrado e pedindo para falar com uma pessoa, use a ferramenta \`scheduleHumanFollowUp\`.
- Ao usar a ferramenta, passe as informações do usuário que foram fornecidas a você: {{userName}} e {{userContact}}.
- Ao usar a ferramenta, informe ao usuário que um membro da equipe entrará em contato em breve.

Converse com o usuário.

Histórico da Conversa:
{{#each history}}
- {{role}}: {{{content}}}
{{/each}}
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {

    let userName: string | undefined = undefined;
    let userContact: string | undefined = undefined;

    // Busca os dados do usuário se um ID for fornecido
    if (input.userId) {
        const userDoc = await getDoc(doc(db, 'tutors', input.userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            userName = data.name;
            userContact = data.email || data.phone;
        }
    }

    const messages: Message[] = input.history.map(
      (message) =>
        new Message({
          role: message.role,
          content: [{ text: message.content }],
        })
    );

    while (true) {
      const response = await prompt({ history: messages, userName, userContact });
      const choice = response.choices[0];

      if (!choice) {
        throw new Error('No valid choice in AI response.');
      }
      
      const toolRequestPart = choice.message.content.find(part => part.toolRequest) as ToolRequestPart | undefined;
      
      if (!toolRequestPart) {
        // Se não houver solicitação de ferramenta, retorne o texto da resposta.
        return choice.message.content.map(part => part.text || '').join('');
      }

      // Se houver uma solicitação de ferramenta, execute-a.
      const toolResponse = await toolRequestPart.toolRequest.execute();
      messages.push(choice.message);
      messages.push(renderToolResponse(toolRequestPart.toolRequest, toolResponse));
    }
  }
);
