import Stripe from "stripe";
import { env } from "../config/env";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!env.stripeSecretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(env.stripeSecretKey);
}

interface CheckoutLineItem {
  title: string;
  unitPriceCents: number;
  quantity: number;
}

/**
 * Crée une session Stripe Checkout hébergée pour une commande de boutique.
 * Retourne `null` si Stripe n'est pas configuré (mode développement sans clé) —
 * l'appelant doit alors informer la personne que le paiement carte n'est pas
 * encore actif plutôt que de planter.
 */
export async function createOrderCheckoutSession(params: {
  orderId: string;
  customerEmail: string;
  items: CheckoutLineItem[];
  taxCents: number;
}): Promise<{ url: string; sessionId: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "cad",
      unit_amount: item.unitPriceCents,
      product_data: { name: item.title },
    },
  }));

  if (params.taxCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "cad",
        unit_amount: params.taxCents,
        product_data: { name: "TPS / TVQ" },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: lineItems,
    success_url: `${env.clientUrl}/boutique?commande=succes&order=${params.orderId}`,
    cancel_url: `${env.clientUrl}/boutique?commande=annulee`,
    metadata: { orderId: params.orderId },
  });

  if (!session.url) return null;
  return { url: session.url, sessionId: session.id };
}

/**
 * Crée une session Stripe Checkout pour le paiement (ou le dépôt) d'un rendez-vous.
 */
export async function createAppointmentCheckoutSession(params: {
  appointmentId: string;
  customerEmail: string;
  serviceTitle: string;
  amountCents: number;
}): Promise<{ url: string; sessionId: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: params.amountCents,
          product_data: { name: params.serviceTitle },
        },
      },
    ],
    success_url: `${env.clientUrl}/tableau-de-bord?rendezvous=confirme`,
    cancel_url: `${env.clientUrl}/tableau-de-bord?rendezvous=annule`,
    metadata: { appointmentId: params.appointmentId },
  });

  if (!session.url) return null;
  return { url: session.url, sessionId: session.id };
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe n'est pas configuré.");
  if (!env.stripeWebhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET n'est pas configuré.");
  return stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
}
