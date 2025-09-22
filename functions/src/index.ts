
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";
import { subDays, format } from "date-fns";

// Inicialize o SDK do Admin para poder acessar o Firestore.
admin.initializeApp();
const db = admin.firestore();

// Carregue a chave de API do Resend a partir da configuração de ambiente do Firebase.
// Lembre-se de configurar isso com: firebase functions:config:set resend.apikey="SUA_CHAVE_AQUI"
const resend = new Resend(functions.config().resend.apikey);

/**
 * Função agendada para rodar todos os dias às 8:00 da manhã.
 * Verifica por vacinas e check-ups que estão próximos de vencer.
 */
export const dailyReminderCheck = functions.pubsub
  .schedule("every day 08:00")
  .timeZone("America/Sao_Paulo")
  .onRun(async (context) => {
    console.log("Iniciando verificação diária de lembretes...");

    const sevenDaysFromNow = admin.firestore.Timestamp.fromDate(
      new Date(new Date().setDate(new Date().getDate() + 7))
    );
    const today = admin.firestore.Timestamp.now();
    const elevenMonthsAgo = admin.firestore.Timestamp.fromDate(
      subDays(new Date(), 335) // Aprox. 11 meses
    );

    // 1. Lembretes de Vacina
    const petsWithUpcomingVaccines = await db
      .collection("pets")
      .where("vaccineHistory.nextDueDate", ">=", today)
      .where("vaccineHistory.nextDueDate", "<=", sevenDaysFromNow)
      .get();

    for (const petDoc of petsWithUpcomingVaccines.docs) {
      const pet = petDoc.data();
      const tutorDoc = await db.collection("tutors").doc(pet.tutorId).get();
      if (!tutorDoc.exists) continue;
      const tutor = tutorDoc.data()!;

      const upcomingVaccines = pet.vaccineHistory.filter(
        (v: any) =>
          v.nextDueDate.toDate() >= today.toDate() &&
          v.nextDueDate.toDate() <= sevenDaysFromNow.toDate()
      );

      for (const vaccine of upcomingVaccines) {
        console.log(`Enviando lembrete de vacina para ${tutor.email} sobre o pet ${pet.name}`);
        await resend.emails.send({
          from: "VetCare+ <nao-responda@sua-clinica.com>",
          to: tutor.email,
          subject: `Lembrete: Vacina do(a) ${pet.name} está próxima!`,
          html: `
            <h1>Olá, ${tutor.name}!</h1>
            <p>Um lembrete amigável de que a vacina <strong>${vaccine.vaccineName}</strong> do(a) seu companheiro(a) <strong>${pet.name}</strong> está agendada para o dia <strong>${format(vaccine.nextDueDate.toDate(), "dd/MM/yyyy")}</strong>.</p>
            <p>Manter as vacinas em dia é essencial para a saúde dele(a). Que tal já agendar um horário conosco?</p>
            <p>Atenciosamente,<br>Equipe VetCare+</p>
          `,
        });
      }
    }

    // 2. Lembrete de Check-up Anual
    const petsNeedingCheckup = await db
      .collection("pets")
      .where("lastCheckupDate", "<=", elevenMonthsAgo)
      .get();

    for (const petDoc of petsNeedingCheckup.docs) {
       const pet = petDoc.data();
       const tutorDoc = await db.collection("tutors").doc(pet.tutorId).get();
       if (!tutorDoc.exists) continue;
       const tutor = tutorDoc.data()!;

       console.log(`Enviando lembrete de check-up para ${tutor.email} sobre o pet ${pet.name}`);
       await resend.emails.send({
          from: "VetCare+ <nao-responda@sua-clinica.com>",
          to: tutor.email,
          subject: `Está na hora do check-up anual do(a) ${pet.name}!`,
          html: `
            <h1>Olá, ${tutor.name}!</h1>
            <p>Notamos que já faz quase um ano desde o último check-up geral do(a) <strong>${pet.name}</strong>.</p>
            <p>Um check-up preventivo é a melhor forma de garantir que ele(a) continue saudável e feliz ao seu lado. Vamos agendar uma nova avaliação?</p>
            <p>Atenciosamente,<br>Equipe VetCare+</p>
          `,
        });

        // Atualiza a data do último check-up para evitar múltiplos envios.
        // Uma abordagem melhor seria ter um campo "lastReminderSent"
        await petDoc.ref.update({ lastCheckupDate: admin.firestore.Timestamp.now() });
    }

    return null;
  });


/**
 * Função de gatilho que é acionada quando uma fatura (invoice) é atualizada.
 * Se o status mudou para "Pago", envia um e-mail de follow-up.
 */
export const postConsultationFollowUp = functions.firestore
  .document("invoices/{invoiceId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Verifica se o status mudou para "Pago"
    if (newData.status === "Pago" && previousData.status !== "Pago") {
      const { clientId, petName } = newData;
      const tutorDoc = await db.collection("tutors").doc(clientId).get();
      if (!tutorDoc.exists) {
        console.error(`Tutor com ID ${clientId} não encontrado.`);
        return;
      }
      const tutor = tutorDoc.data()!;

      // Idealmente, a função esperaria 24h.
      // Para simplificar, vamos enviar imediatamente.
      // Para um delay real, seria preciso usar Cloud Tasks.
      console.log(`Enviando e-mail de follow-up para ${tutor.email} sobre o pet ${petName}`);
      await resend.emails.send({
        from: "VetCare+ <nao-responda@sua-clinica.com>",
        to: tutor.email,
        subject: `Como o(a) ${petName} está se sentindo?`,
        html: `
            <h1>Olá, ${tutor.name}!</h1>
            <p>Gostaríamos de saber como o(a) <strong>${petName}</strong> está se sentindo após a última visita à nossa clínica.</p>
            <p>Sua opinião é muito importante para nós e nos ajuda a melhorar sempre. Se tiver um momento, adoraríamos se pudesse nos avaliar.</p>
            <p>Qualquer dúvida ou preocupação, estamos à disposição!</p>
            <p>Atenciosamente,<br>Equipe VetCare+</p>
          `,
      });
    }
  });

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
