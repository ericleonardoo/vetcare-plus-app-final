/**
 * Funções de Backend para VetCare+
 *
 * Este arquivo contém as automações que rodam no servidor Firebase.
 *
 * PARA IMPLANTAR (DEPLOY):
 * 1. Configure sua API Key do Resend no ambiente do Firebase:
 *    firebase functions:config:set resend.apikey="SUA_CHAVE_AQUI"
 * 2. Execute o comando no terminal na raiz do projeto:
 *    firebase deploy --only functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";

// Inicialize o SDK do Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Inicialize o SDK do Resend com a chave de API do ambiente de configuração
const resend = new Resend(functions.config().resend.apikey);


/**
 * Função agendada para rodar diariamente e verificar lembretes de vacina e check-up.
 */
export const dailyReminderCheck = functions
  .region("southamerica-east1")
  .pubsub.schedule("every 24 hours")
  .onRun(async (context) => {
    console.log("Iniciando verificação diária de lembretes...");

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(now.getMonth() - 11);

    try {
      const petsSnapshot = await db.collection("pets").get();

      for (const petDoc of petsSnapshot.docs) {
        const pet = petDoc.data();
        if (!pet.tutorId) continue;
        const tutorRef = db.collection("tutors").doc(pet.tutorId);
        const tutorDoc = await tutorRef.get();
        if (!tutorDoc.exists) continue;
        const tutor = tutorDoc.data()!;

        // 1. Lógica do "Vigilante de Vacinas"
        if (pet.vaccineHistory && pet.vaccineHistory.length > 0) {
          for (const vaccine of pet.vaccineHistory) {
            const nextDueDate = vaccine.nextDueDate.toDate(); // Converte Timestamp para Date
            if (nextDueDate <= sevenDaysFromNow && nextDueDate >= now) {
                console.log(`Enviando lembrete de vacina para ${tutor.name} sobre ${pet.name}`);
                await sendEmail({
                    to: tutor.email,
                    subject: `Lembrete de Vacina para ${pet.name}!`,
                    html: `<p>Olá ${tutor.name},</p><p>Está quase na hora de renovar a vacina <strong>${vaccine.vaccineName}</strong> do(a) ${pet.name}. A data limite é ${nextDueDate.toLocaleDateString("pt-BR")}.</p><p>Agende uma consulta conosco para manter a saúde do seu melhor amigo em dia!</p><p>Atenciosamente,<br>Equipe VetCare+</p>`,
                });
            }
          }
        }

        // 2. Lógica do "Lembrete de Check-up Anual"
        if (pet.lastCheckupDate) {
          const lastCheckup = pet.lastCheckupDate.toDate();
          if (lastCheckup <= elevenMonthsAgo) {
            console.log(`Enviando lembrete de check-up para ${tutor.name} sobre ${pet.name}`);
            await sendEmail({
                to: tutor.email,
                subject: `Hora do Check-up Anual do(a) ${pet.name}!`,
                html: `<p>Olá ${tutor.name},</p><p>Já faz quase um ano desde o último check-up do(a) ${pet.name}. A prevenção é a melhor forma de cuidado!</p><p>Que tal agendar um check-up para garantir que está tudo bem? Estamos te esperando!</p><p>Atenciosamente,<br>Equipe VetCare+</p>`,
            });
          }
        }
      }
      console.log("Verificação diária de lembretes concluída.");
      return null;
    } catch (error) {
      console.error("Erro ao executar a verificação diária de lembretes:", error);
      return null;
    }
  });


/**
 * Função de gatilho para enviar e-mail de follow-up após o pagamento de uma fatura.
 */
export const postConsultationFollowUp = functions
  .region("southamerica-east1")
  .firestore.document("invoices/{invoiceId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    // Verifica se o status mudou para "Pago"
    if (newValue.status === "Pago" && previousValue.status !== "Pago") {
      const { clientId, petName } = newValue;

      const tutorDoc = await db.collection("tutors").doc(clientId).get();
      if (!tutorDoc.exists) {
        console.error(`Tutor com ID ${clientId} não encontrado.`);
        return;
      }
      const tutor = tutorDoc.data()!;

      console.log(`Fatura paga. Agendando follow-up para ${tutor.name} sobre ${petName}.`);
      
      // Para um atraso real, o ideal é usar o Cloud Tasks.
      // Para simplificar, enviaremos o e-mail imediatamente.
      await sendEmail({
          to: tutor.email,
          subject: `Como o(a) ${petName} está se sentindo?`,
          html: `<p>Olá ${tutor.name},</p><p>Esperamos que o(a) ${petName} esteja se recuperando bem após a recente visita à VetCare+.</p><p>Sua opinião é muito importante para nós e nos ajuda a melhorar sempre. Se tiver um momento, adoraríamos saber como foi sua experiência.</p><p>Qualquer dúvida, estamos à disposição!</p><p>Atenciosamente,<br>Equipe VetCare+</p>`,
      });
    }
  });


/**
 * Função auxiliar para enviar e-mails usando o Resend.
 */
async function sendEmail(payload: { to: string, subject: string, html: string }) {
    try {
        await resend.emails.send({
            from: "VetCare+ <onboarding@resend.dev>", // O domínio precisa ser verificado no Resend
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });
        console.log(`E-mail enviado para ${payload.to}`);
    } catch (error) {
        console.error(`Erro ao enviar e-mail para ${payload.to}:`, error);
    }
}
