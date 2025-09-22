
/**
 * @fileOverview Inicializa e exporta a instância global do Genkit.
 * Este arquivo serve como a única fonte de verdade para a configuração do Genkit,
 * garantindo que a mesma instância seja usada em toda a aplicação.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(), // Configura o plugin do Google AI
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
