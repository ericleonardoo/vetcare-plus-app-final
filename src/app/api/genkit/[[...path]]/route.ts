/**
 * @fileoverview This file is the entrypoint for Genkit's Next.js integration.
 */

import { genkit } from '@genkit-ai/next';
import { googleAI } from '@genkit-ai/googleai';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '../../../../../../.env') });

// Import all the flows and tools so that Genkit can register them.
import '@/ai/flows/suggest-appointment-times';
import '@/ai/flows/chat';
import '@/ai/flows/generate-care-plan';
import '@/ai/tools/clinic-tools';

export const { GET, POST } = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
