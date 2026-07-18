import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { servicesRouter } from "./routes/services.routes";
import { appointmentsRouter } from "./routes/appointments.routes";
import { blogRouter } from "./routes/blog.routes";
import { eventsRouter } from "./routes/events.routes";
import { testimonialsRouter } from "./routes/testimonials.routes";
import { productsRouter } from "./routes/products.routes";
import { ordersRouter } from "./routes/orders.routes";
import { usersRouter } from "./routes/users.routes";
import { miscRouter } from "./routes/misc.routes";
import { webhooksRouter } from "./routes/webhooks.routes";
import { adminRouter } from "./routes/admin.routes";
import { calendarRouter } from "./routes/calendar.routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );

  // IMPORTANT : cette route doit recevoir le corps brut (Buffer), pas du JSON
  // déjà parsé, car Stripe signe l'octet exact du corps de la requête.
  // Elle doit donc être montée AVANT express.json() ci-dessous.
  app.use("/api/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // Limite globale généreuse ; les routes sensibles (auth) ont leur propre limite plus stricte.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de tentatives. Réessayez plus tard." },
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: env.nodeEnv });
  });

  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/blog", blogRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/testimonials", testimonialsRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/calendar", calendarRouter);
  app.use("/api", miscRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
