import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
};

/* ---------------------------------------------------------------------- */
/* Utilisateurs et rôles                                                  */
/* ---------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  // super_admin | admin | employee | practitioner | client | guest
  role: text("role").notNull().default("client"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  ...timestamps,
});

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

/* ---------------------------------------------------------------------- */
/* Services et réservations                                               */
/* ---------------------------------------------------------------------- */

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  includes: text("includes"), // JSON stringifié : string[]
  relatedSlugs: text("related_slugs"), // JSON stringifié : string[]
  durationMinutes: integer("duration_minutes").notNull(),
  priceCents: integer("price_cents").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const availabilities = pgTable("availabilities", {
  id: text("id").primaryKey(),
  // 0 = dimanche ... 6 = samedi
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  bufferMinutes: integer("buffer_minutes").notNull().default(15),
});

export const blockedDates = pgTable("blocked_dates", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // "2026-08-15"
  reason: text("reason"),
});

export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  // pending | confirmed | cancelled | completed
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
  googleEventId: text("google_event_id"),
  ...timestamps,
});

/* ---------------------------------------------------------------------- */
/* Paiements et facturation                                               */
/* ---------------------------------------------------------------------- */

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  appointmentId: text("appointment_id").references(() => appointments.id),
  orderId: text("order_id"),
  subtotalCents: integer("subtotal_cents").notNull(),
  gstCents: integer("gst_cents").notNull().default(0),
  qstCents: integer("qst_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  // stripe | interac
  paymentMethod: text("payment_method").notNull(),
  // pending | paid | refunded | partial
  status: text("status").notNull().default("pending"),
  ...timestamps,
});

/* ---------------------------------------------------------------------- */
/* Blogue                                                                 */
/* ---------------------------------------------------------------------- */

export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  authorId: text("author_id").references(() => users.id),
  category: text("category"),
  // draft | published
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

/* ---------------------------------------------------------------------- */
/* Événements                                                             */
/* ---------------------------------------------------------------------- */

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  capacity: integer("capacity"),
  priceCents: integer("price_cents").default(0),
  ...timestamps,
});

/* ---------------------------------------------------------------------- */
/* Témoignages                                                            */
/* ---------------------------------------------------------------------- */

export const testimonials = pgTable("testimonials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  quote: text("quote").notNull(),
  serviceId: text("service_id").references(() => services.id),
  isApproved: boolean("is_approved").notNull().default(false),
  ...timestamps,
});

/* ---------------------------------------------------------------------- */
/* Boutique                                                               */
/* ---------------------------------------------------------------------- */

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  // physical | digital | course | gift_card
  type: text("type").notNull(),
  stock: integer("stock"),
  fileUrl: text("file_url"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  totalCents: integer("total_cents").notNull(),
  // pending | paid | fulfilled | refunded
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  ...timestamps,
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

/* ---------------------------------------------------------------------- */
/* Contact                                                                */
/* ---------------------------------------------------------------------- */

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

/* ---------------------------------------------------------------------- */
/* Infolettre                                                             */
/* ---------------------------------------------------------------------- */

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().default(sql`now()`),
});

/* ---------------------------------------------------------------------- */
/* Connexion Google Calendar (une seule connexion, pour tout le studio)   */
/* ---------------------------------------------------------------------- */

export const calendarConnections = pgTable("calendar_connections", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull().default("google"),
  connectedEmail: text("connected_email").notNull(),
  calendarId: text("calendar_id").notNull().default("primary"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  ...timestamps,
});

/* ---------------------------------------------------------------------- */
/* Compteur de factures (numérotation séquentielle)                       */
/* ---------------------------------------------------------------------- */

export const invoiceCounters = pgTable("invoice_counters", {
  year: integer("year").primaryKey(),
  count: integer("count").notNull().default(0),
});
