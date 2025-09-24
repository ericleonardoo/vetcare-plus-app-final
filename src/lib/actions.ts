
'use server';

import { suggestAppointmentTimes as suggestAppointmentTimesFlow } from "@/ai/flows/suggest-appointment-times";
import type { ChatInput, ChatOutput } from "@/ai/flows/chat";
import { generateCarePlan as generateCarePlanFlow } from "@/ai/flows/generate-care-plan";
import type { GenerateCarePlanInput, GenerateCarePlanOutput } from "@/ai/flows/generate-care-plan";
import { scheduleHumanFollowUpFlow, getNotifications as getNotificationsTool, clearAllNotifications as clearNotificationsTool } from '@/ai/tools/clinic-tools';
import { z } from "zod";
import { addDays } from "date-fns";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase";
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
        const result = await suggestAppointmentTimesFlow({
            serviceType,
            timeZone,
            durationMinutes,
            numberOfSuggestions: 5,
            date: new Date().toISOString(), // Passa a data atual como padrão
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


// Ações do Perfil do Tutor com Firestore
const profileFormSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    email: z.string().email("Por favor, insira um endereço de e-mail válido."),
    phone: z.string().min(10, "Por favor, insira um número de telefone válido."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export async function updateUserProfile(userId: string, data: ProfileFormValues) {
    // Primeira camada de defesa: garantir que temos um userId
    if (!userId) {
        console.error("[ACTION] Tentativa de atualizar perfil sem um userId!");
        return { success: false, error: "Usuário não autenticado." };
    }

    console.log(`[ACTION] Iniciando a atualização do perfil para o usuário: ${userId}`);
    console.log("[ACTION] Dados recebidos:", data);
    
    const validatedData = profileFormSchema.safeParse(data);
    if (!validatedData.success) {
        console.error("[ACTION] ERRO: Dados de perfil inválidos.", validatedData.error);
        return { success: false, error: "Os dados fornecidos são inválidos." };
    }
    
    try {
        const tutorRef = doc(db, 'tutors', userId);
        console.log("[ACTION] Tentando atualizar o documento em:", tutorRef.path);
        
        // Usamos setDoc com merge:true. Isso é mais seguro para perfis.
        // Ele cria o documento se não existir, ou atualiza se já existir.
        await setDoc(tutorRef, validatedData.data, { merge: true });
        
        console.log("[ACTION] Perfil atualizado/criado com SUCESSO!");
        
        revalidatePath('/portal/dashboard');
        revalidatePath('/portal/perfil');

        return { success: true, message: "Perfil atualizado com sucesso!" };

    } catch (error) {
        // O PASSO MAIS IMPORTANTE DE TODOS!
        console.error("!!!!!!!!!! [ACTION] ERRO CRÍTICO AO ATUALIZAR O PERFIL !!!!!!!!!!", error);
        return { success: false, error: (error as Error).message };
    }
}
