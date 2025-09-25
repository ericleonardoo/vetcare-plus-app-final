
'use server';

import { suggestAppointmentTimes as suggestAppointmentTimesFlow } from "@/ai/flows/suggest-appointment-times";
import type { ChatInput, ChatOutput } from "@/ai/flows/chat";
import { generateCarePlan as generateCarePlanFlow } from "@/ai/flows/generate-care-plan";
import type { GenerateCarePlanInput, GenerateCarePlanOutput } from "@/ai/flows/generate-care-plan";
import { scheduleHumanFollowUpFlow, getNotifications as getNotificationsTool, clearAllNotifications as clearNotificationsTool } from '@/ai/tools/clinic-tools';
import { z } from "zod";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { revalidatePath } from "next/cache";

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


export async function getSuggestedTimesForPortal(data: PortalAppointmentFormInput) {
    const validatedData = portalAppointmentFormSchema.safeParse(data);

    if (!validatedData.success) {
        return { success: false, error: "Dados inválidos fornecidos." };
    }

    const { serviceType, timeZone, date } = validatedData.data;
    const durationMinutes = serviceDurations[serviceType] || 30;

    try {
        // A Server Action agora apenas passa os dados para o fluxo de IA.
        // Toda a lógica de busca de dados do Firestore foi movida para o fluxo.
        const result = await suggestAppointmentTimesFlow({
            serviceType,
            timeZone,
            durationMinutes,
            numberOfSuggestions: 8,
            date: date.toISOString(),
        });

        // O fluxo já retorna os horários filtrados pela data, então o filtro aqui não é mais necessário.
        return { success: true, data: result.suggestedAppointmentTimes };
    } catch (error) {
        console.error("Erro no fluxo de IA:", error);
        return { success: false, error: "Falha ao sugerir horários. Por favor, tente novamente mais tarde." };
    }
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

export async function getNotifications() {
    return { success: true, data: await getNotificationsTool() };
}

export async function clearAllNotifications() {
    await clearNotificationsTool();
    return { success: true };
}

const profileUpdateSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
});

export async function updateUserProfile(userId: string, data: { name: string, phone: string }) {
    const validatedData = profileUpdateSchema.safeParse(data);
    if (!validatedData.success) {
        return { success: false, error: "Dados inválidos." };
    }

    if (!userId) {
        return { success: false, error: "ID do usuário não fornecido."}
    }

    try {
        const userDocRef = doc(db, 'tutors', userId);
        await setDoc(userDocRef, {
            name: validatedData.data.name,
            phone: validatedData.data.phone
        }, { merge: true });

        revalidatePath('/professional/perfil');
        return { success: true, message: "Perfil atualizado com sucesso!" };

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return { success: false, error: "Não foi possível salvar as informações." };
    }
}
