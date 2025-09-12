'use server';

/**
 * @fileOverview Gera um plano de cuidados personalizado para um pet usando IA.
 *
 * - generateCarePlan - Uma função que gera o plano de cuidados.
 * - GenerateCarePlanInput - O tipo de entrada para a função generateCarePlan.
 * - GenerateCarePlanOutput - O tipo de retorno para a função generateCarePlan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCarePlanInputSchema = z.object({
  species: z.string().describe('A espécie do pet (ex: Cachorro, Gato).'),
  breed: z.string().describe('A raça do pet.'),
  age: z.string().describe('A idade do pet.'),
  healthHistory: z.string().describe('Um resumo do histórico de saúde do pet.'),
});
export type GenerateCarePlanInput = z.infer<typeof GenerateCarePlanInputSchema>;

const GenerateCarePlanOutputSchema = z.object({
  nutrition: z.object({
    title: z.string().describe('Título para a seção de nutrição.'),
    recommendation: z.string().describe('A recomendação nutricional detalhada.'),
  }),
  exercise: z.object({
     title: z.string().describe('Título para a seção de exercícios.'),
    recommendation: z.string().describe('A recomendação de exercícios e atividades físicas.'),
  }),
  preventiveHealth: z.object({
     title: z.string().describe('Título para a seção de saúde preventiva.'),
    recommendation: z.string().describe('A recomendação de cuidados preventivos de saúde.'),
  }),
});
export type GenerateCarePlanOutput = z.infer<typeof GenerateCarePlanOutputSchema>;

export async function generateCarePlan(input: GenerateCarePlanInput): Promise<GenerateCarePlanOutput> {
  return generateCarePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCarePlanPrompt',
  input: { schema: GenerateCarePlanInputSchema },
  output: { schema: GenerateCarePlanOutputSchema },
  prompt: `Você é um veterinário especialista em bem-estar animal criando um plano de cuidados para um pet.
Seu objetivo é fornecer recomendações claras, úteis e concisas para o tutor do animal.
Crie um plano de cuidados para o pet com as seguintes características:
- Espécie: {{{species}}}
- Raça: {{{breed}}}
- Idade: {{{age}}}
- Histórico de Saúde Resumido: {{{healthHistory}}}

Seja positivo e encorajador. Forneça recomendações práticas para nutrição, exercícios e saúde preventiva.
O título de cada seção deve ser curto e cativante.
O conteúdo da recomendação deve ter no máximo 2-3 frases.
`,
});

const generateCarePlanFlow = ai.defineFlow(
  {
    name: 'generateCarePlanFlow',
    inputSchema: GenerateCarePlanInputSchema,
    outputSchema: GenerateCarePlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
