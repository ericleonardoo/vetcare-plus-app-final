/**
 * @fileOverview Reexporta a instância global do Genkit.
 * Após a configuração central em `genkit.config.ts`, este arquivo
 * serve como um atalho conveniente para acessar o objeto `ai` em toda a aplicação.
 */
import { genkit } from 'genkit';

export const ai = genkit();
