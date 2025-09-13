
'use server';

import { suggestAppointmentTimes } from "@/ai/flows/suggest-appointment-times";
import { chat as chatFlow, ChatInput, ChatOutput } from "@/ai/flows/chat";
import { generateCarePlan as generateCarePlanFlow, GenerateCarePlanInput, GenerateCarePlanOutput } from "@/ai/flows/generate-care-plan";
import { scheduleHumanFollowUpFlow } from '@/ai/tools/clinic-tools';
import { z } from "zod";
import { addDays } from "date-fns";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { revalidatePath } from "next/cache";

const appointmentFormSchema = z.object({
  ownerName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  petName: z.string().min(1, "O nome do pet é obrigatório."),
  email: z.string().email("Por favor, insira um endereço de e-mail válido."),
  phone: z.string().min(10, "Por favor, insira um número de telefone válido."),
  serviceType: z.string({ required_error: 'Por favor, selecione um serviço.' }),
  timeZone: z.string(),
});

type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;

// Em uma aplicação real, isso viria de um banco de dados.
const staffAvailability = JSON.stringify({
  "Segunda-feira": ["09:00-12:00", "14:00-17:00"],
  "Terça-feira": ["09:00-17:00"],
  "Quarta-feira": ["09:00-12:00"],
  "Quinta-feira": ["09:00-17:00"],
  "Sexta-feira": ["09:00-15:00"],
  "Sábado": ["10:00-14:00"],
  "Domingo": []
});

const serviceDurations: Record<string, number> = {
    'Check-up de Rotina': 30,
    'Vacinação': 20,
    'Limpeza Dental': 60,
    'Consulta para Cirurgia': 45,
    'Banho e Tosa': 90,
    'Atendimento de Emergência': 60,
};

const portalAppointmentFormSchema = z.object({
    serviceType: z.string({ required_error: 'Por favor, selecione um serviço.' }),
    timeZone: z.string(),
    date: z.date(),
});
type PortalAppointmentFormInput = z.infer<typeof portalAppointmentFormSchema>;


export async function getSuggestedTimes(data: AppointmentFormInput) {
    const validatedData = appointmentFormSchema.safeParse(data);

    if (!validatedData.success) {
        return { success: false, error: "Dados inválidos fornecidos." };
    }

    const { serviceType, timeZone } = validatedData.data;
    const durationMinutes = serviceDurations[serviceType] || 30;

    try {
        const result = await suggestAppointmentTimes({
            serviceType,
            staffAvailability,
            timeZone,
            durationMinutes,
            numberOfSuggestions: 5,
        });
        return { success: true, data: result.suggestedAppointmentTimes };
    } catch (error) {
        console.error("Erro no fluxo de IA:", error);
        return { success: false, error: "Falha ao sugerir horários. Por favor, tente novamente mais tarde." };
    }
}

export async function getSuggestedTimesForPortal(data: PortalAppointmentFormInput) {
    const validatedData = portalAppointmentFormSchema.safeParse(data);

    if (!validatedData.success) {
        return { success: false, error: "Dados inválidos fornecidos." };
    }

    const { serviceType, timeZone, date } = validatedData.data;

    const blockedTimes = [
      addDays(date, 0).toISOString().split('T')[0] + 'T10:00:00',
      addDays(date, 0).toISOString().split('T')[0] + 'T14:30:00',
    ];

    const availabilityWithBlockedTimes = {
      ...JSON.parse(staffAvailability),
      blocked: blockedTimes,
      dateRange: {
        start: date.toISOString(),
        end: addDays(date, 1).toISOString()
      }
    }

    const durationMinutes = serviceDurations[serviceType] || 30;

    try {
        const result = await suggestAppointmentTimes({
            serviceType,
            staffAvailability: JSON.stringify(availabilityWithBlockedTimes),
            timeZone,
            durationMinutes,
            numberOfSuggestions: 8,
        });

        const filteredTimes = result.suggestedAppointmentTimes.filter(time => {
            const suggestedDate = new Date(time);
            return suggestedDate.getFullYear() === date.getFullYear() &&
                   suggestedDate.getMonth() === date.getMonth() &&
                   suggestedDate.getDate() === date.getDate();
        });


        return { success: true, data: filteredTimes };
    } catch (error) {
        console.error("Erro no fluxo de IA:", error);
        return { success: false, error: "Falha ao sugerir horários. Por favor, tente novamente mais tarde." };
    }
}

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return await chatFlow(input);
}


export async function generateCarePlan(data: GenerateCarePlanInput): Promise<{success: true, data: GenerateCarePlanOutput} | {success: false, error: string}> {
    try {
        const result = await generateCarePlanFlow(data);
        return { success: true, data: result };
    } catch (error) {
        console.error("Erro no fluxo de IA para gerar plano de cuidados:", error);
        return { success: false, error: "Falha ao gerar o plano de cuidados. Tente novamente." };
    }
}


export type ScheduleHumanFollowUpInput = z.infer<typeof ScheduleHumanFollowUpInputSchema>;

const ScheduleHumanFollowUpInputSchema = z.object({
  userName: z.string().describe('O nome do usuário que solicita o contato.'),
  userContact: z.string().describe('A informação de contato do usuário (email ou telefone).'),
  reason: z.string().describe('Um breve resumo do motivo pelo qual o usuário precisa de ajuda.'),
});

export async function scheduleHumanFollowUp(input: ScheduleHumanFollowUpInput) {
    const validatedData = ScheduleHumanFollowUpInputSchema.safeParse(input);
    if (!validatedData.success) {
        return { success: false, error: "Dados de entrada para notificação inválidos." };
    }

    try {
        const result = await scheduleHumanFollowUpFlow(validatedData.data);
        return { success: true, data: result };
    } catch (error) {
        console.error('Erro na ferramenta de IA scheduleHumanFollowUp', error);
        return { success: false, error: 'Falha ao notificar o atendente.'}
    }
}

// Ações do Perfil do Tutor com Firestore
const profileFormSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    email: z.string().email("Por favor, insira um endereço de e-mail válido."),
    phone: z.string().min(10, "Por favor, insira um número de telefone válido."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export async function updateUserProfile(userId: string, data: ProfileFormValues) {
    if (!userId) {
        return { success: false, error: "Usuário não autenticado." };
    }

    const validatedData = profileFormSchema.safeParse(data);
    if (!validatedData.success) {
        return { success: false, error: "Dados inválidos fornecidos." };
    }
    
    try {
        const tutorRef = doc(db, 'tutors', userId);
        await setDoc(tutorRef, validatedData.data, { merge: true });
        
        revalidatePath('/portal/perfil');
        revalidatePath('/portal/dashboard');

        return { success: true, message: "Perfil atualizado com sucesso!" };

    } catch (error) {
        console.error("Erro ao atualizar perfil no Firestore:", error);
        return { success: false, error: "Ocorreu um erro ao salvar suas informações." };
    }
}
