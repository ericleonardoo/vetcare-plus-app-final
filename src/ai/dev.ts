import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-appointment-times.ts';
import '@/ai/flows/chat.ts';
import '@/ai/flows/generate-care-plan.ts';
import '@/ai/tools/clinic-tools.ts';
