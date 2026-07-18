import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required(
    "DATABASE_URL",
    "postgres://retour:retour@localhost:5432/retour_chez_soi"
  ),
  jwtSecret: required(
    "JWT_SECRET",
    process.env.NODE_ENV === "production" ? undefined : "dev-secret-change-me"
  ),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientUrl:
    process.env.CLIENT_URL ??
    (process.env.FRONTEND_HOST ? `https://${process.env.FRONTEND_HOST}.onrender.com` : "http://localhost:5173"),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "Le Retour Chez Soi <bonjour@leretourchezsoi.ca>",
  adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? "admin@leretourchezsoi.ca",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:4000/api/calendar/google/callback",
};
