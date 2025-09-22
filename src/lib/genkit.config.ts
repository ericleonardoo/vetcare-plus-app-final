'use server';

/**
 * @fileOverview Arquivo de configuração central para o Genkit.
 * Este arquivo é responsável por inicializar e configurar os plugins e
 * configurações globais do Genkit, garantindo que a IA esteja pronta
 * para ser usada em qualquer parte da aplicação, especialmente nas Server Actions.
 */

import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// A inicialização que antes estava na rota de API, agora vive aqui.
configureGenkit({
  plugins: [
    googleAI(), // Configura o plugin do Google AI
  ],
  logLevel: 'debug', // Manter em debug para vermos os logs
  enableTracingAndMetrics: true,
});
