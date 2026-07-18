import { Resend } from "resend";
import { env } from "../config/env";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!env.resendApiKey) return null;
  if (!resendClient) resendClient = new Resend(env.resendApiKey);
  return resendClient;
}

export function isEmailConfigured(): boolean {
  return Boolean(env.resendApiKey);
}

interface SendParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envoie un courriel via Resend. Si aucune clé API n'est configurée (mode
 * développement), le courriel est simplement journalisé plutôt qu'envoyé,
 * pour ne jamais bloquer le flux principal (inscription, réservation, etc.).
 */
async function send({ to, subject, html }: SendParams): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email désactivé — RESEND_API_KEY manquante] À: ${to} | Sujet: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: env.resendFromEmail, to, subject, html });
  } catch (err) {
    // Un échec d'envoi de courriel ne doit jamais faire échouer la requête principale.
    console.error("Échec de l'envoi du courriel Resend :", err);
  }
}

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #514E48;">
      <h1 style="font-family: Georgia, serif; color: #5C3D24; font-weight: 400; font-size: 22px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 13px; color: #8A8478;">
        Le Retour Chez Soi — Québec
      </p>
    </div>
  `;
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  await send({
    to,
    subject: "Bienvenue chez Le Retour Chez Soi",
    html: layout(
      `Bienvenue, ${firstName}`,
      `<p>Votre compte a été créé avec succès. Vous pouvez dès maintenant réserver une séance, consulter vos rendez-vous et suivre vos formations depuis votre espace membre.</p>`
    ),
  });
}

export async function sendAppointmentConfirmationEmail(
  to: string,
  params: { serviceTitle: string; startsAt: string }
) {
  const date = new Date(params.startsAt).toLocaleString("fr-CA", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  });
  await send({
    to,
    subject: "Confirmation de votre rendez-vous",
    html: layout(
      "Rendez-vous confirmé",
      `<p>Votre rendez-vous pour <strong>${params.serviceTitle}</strong> est prévu le <strong>${date}</strong>.</p>
       <p>Un rappel vous sera envoyé 24 heures avant. Vous pouvez gérer ou annuler ce rendez-vous depuis votre tableau de bord.</p>`
    ),
  });
}

export async function sendAppointmentCancellationEmail(
  to: string,
  params: { serviceTitle: string; startsAt: string }
) {
  const date = new Date(params.startsAt).toLocaleString("fr-CA", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  });
  await send({
    to,
    subject: "Annulation de votre rendez-vous",
    html: layout(
      "Rendez-vous annulé",
      `<p>Votre rendez-vous pour <strong>${params.serviceTitle}</strong> prévu le ${date} a bien été annulé.</p>
       <p>N'hésitez pas à réserver un nouveau créneau quand vous serez prêt·e.</p>`
    ),
  });
}

export async function sendAppointmentReminderEmail(
  to: string,
  params: { serviceTitle: string; startsAt: string }
) {
  const date = new Date(params.startsAt).toLocaleString("fr-CA", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  });
  await send({
    to,
    subject: "Rappel — votre rendez-vous est demain",
    html: layout(
      "À demain",
      `<p>Un rappel amical : votre rendez-vous pour <strong>${params.serviceTitle}</strong> a lieu le ${date}.</p>`
    ),
  });
}

export async function sendContactAcknowledgementEmail(to: string, name: string) {
  await send({
    to,
    subject: "Nous avons bien reçu votre message",
    html: layout(
      `Merci, ${name}`,
      `<p>Votre message a bien été reçu. Nous vous répondrons généralement en moins de 48 heures ouvrables.</p>`
    ),
  });
}

export async function sendContactNotificationToAdmin(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await send({
    to: env.adminNotificationEmail,
    subject: `Nouveau message de contact : ${params.subject}`,
    html: layout(
      "Nouveau message de contact",
      `<p><strong>De :</strong> ${params.name} (${params.email})</p>
       <p><strong>Sujet :</strong> ${params.subject}</p>
       <p>${params.message}</p>`
    ),
  });
}

export async function sendNewsletterWelcomeEmail(to: string) {
  await send({
    to,
    subject: "Inscription confirmée à l'infolettre",
    html: layout(
      "C'est confirmé",
      `<p>Merci de vous être inscrit·e. Vous recevrez, une fois par mois, une réflexion, un événement à venir et une invitation à ralentir.</p>`
    ),
  });
}

export async function sendOrderReceiptEmail(
  to: string,
  params: { invoiceNumber: string; totalCents: number }
) {
  await send({
    to,
    subject: `Reçu de commande — ${params.invoiceNumber}`,
    html: layout(
      "Paiement confirmé",
      `<p>Votre commande a été payée avec succès.</p>
       <p><strong>Numéro de facture :</strong> ${params.invoiceNumber}<br/>
       <strong>Montant total :</strong> ${(params.totalCents / 100).toFixed(2)} $ CAD</p>`
    ),
  });
}

export async function sendAppointmentPaymentReceiptEmail(
  to: string,
  params: { invoiceNumber: string; totalCents: number; serviceTitle: string }
) {
  await send({
    to,
    subject: `Reçu de paiement — ${params.invoiceNumber}`,
    html: layout(
      "Paiement confirmé",
      `<p>Votre paiement pour <strong>${params.serviceTitle}</strong> a été reçu avec succès. Votre rendez-vous est maintenant confirmé.</p>
       <p><strong>Numéro de facture :</strong> ${params.invoiceNumber}<br/>
       <strong>Montant payé :</strong> ${(params.totalCents / 100).toFixed(2)} $ CAD</p>`
    ),
  });
}
