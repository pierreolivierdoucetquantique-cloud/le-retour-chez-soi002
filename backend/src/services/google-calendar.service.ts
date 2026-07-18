import { google } from "googleapis";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { calendarConnections } from "../db/schema";
import { env } from "../config/env";
import { newId } from "../utils/id";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

export function isGoogleConfigured(): boolean {
  return Boolean(env.googleClientId && env.googleClientSecret);
}

function createOAuthClient() {
  return new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, env.googleRedirectUri);
}

/** Génère l'URL vers laquelle rediriger la personne pour autoriser l'accès à son calendrier. */
export function getGoogleAuthUrl(): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline", // requis pour obtenir un refresh_token
    prompt: "consent", // force le renvoi d'un refresh_token même en reconnexion
    scope: SCOPES,
  });
}

/** Échange le code d'autorisation reçu dans le callback contre des jetons, et les enregistre. */
export async function connectGoogleCalendar(code: string): Promise<void> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error(
      "Google n'a pas renvoyé de jeton de rafraîchissement. Déconnectez l'accès existant dans myaccount.google.com/permissions puis réessayez."
    );
  }

  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: client, version: "v2" });
  const { data: profile } = await oauth2.userinfo.get();

  // Une seule connexion active à la fois : on remplace l'existante.
  await db.delete(calendarConnections);
  await db.insert(calendarConnections).values({
    id: newId(),
    provider: "google",
    connectedEmail: profile.email ?? "inconnu",
    calendarId: "primary",
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
  });
}

export async function getGoogleConnectionStatus(): Promise<{
  connected: boolean;
  email: string | null;
}> {
  const [row] = await db.select().from(calendarConnections).where(eq(calendarConnections.provider, "google"));
  return { connected: Boolean(row), email: row?.connectedEmail ?? null };
}

export async function disconnectGoogleCalendar(): Promise<void> {
  await db.delete(calendarConnections);
}

/**
 * Retourne un client Calendar authentifié (avec rafraîchissement automatique
 * du jeton d'accès, jeton mis à jour en base si Google en émet un nouveau),
 * ou `null` si aucune connexion n'est active.
 */
async function getAuthenticatedCalendarClient() {
  const [row] = await db.select().from(calendarConnections).where(eq(calendarConnections.provider, "google"));
  if (!row) return null;

  const client = createOAuthClient();
  client.setCredentials({
    access_token: row.accessToken,
    refresh_token: row.refreshToken,
    expiry_date: row.expiryDate ? row.expiryDate.getTime() : undefined,
  });

  client.on("tokens", (tokens) => {
    if (tokens.access_token) {
      void db
        .update(calendarConnections)
        .set({
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          updatedAt: new Date(),
        })
        .where(eq(calendarConnections.id, row.id));
    }
  });

  return { client, calendarId: row.calendarId };
}

interface EventDetails {
  summary: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  attendeeEmail: string;
}

/** Crée un événement dans le calendrier connecté. Retourne `null` si non connecté. */
export async function createCalendarEvent(details: EventDetails): Promise<string | null> {
  const auth = await getAuthenticatedCalendarClient();
  if (!auth) return null;

  const calendar = google.calendar({ version: "v3", auth: auth.client });
  const { data } = await calendar.events.insert({
    calendarId: auth.calendarId,
    requestBody: {
      summary: details.summary,
      description: details.description,
      start: { dateTime: details.startsAt.toISOString() },
      end: { dateTime: details.endsAt.toISOString() },
      attendees: [{ email: details.attendeeEmail }],
    },
  });

  return data.id ?? null;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = await getAuthenticatedCalendarClient();
  if (!auth) return;

  const calendar = google.calendar({ version: "v3", auth: auth.client });
  await calendar.events.delete({ calendarId: auth.calendarId, eventId }).catch(() => {
    // L'événement a peut-être déjà été supprimé manuellement côté Google ; on ignore.
  });
}
