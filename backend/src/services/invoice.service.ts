import { sql } from "../db/client";

/**
 * Génère un numéro de facture séquentiel et lisible, ex. FACT-2026-000042.
 * Utilise une table de compteur dédiée (upsert atomique) pour rester correct
 * sous accès concurrents.
 */
export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const rows = await sql<{ count: number }[]>`
    INSERT INTO invoice_counters (year, count) VALUES (${year}, 1)
    ON CONFLICT (year) DO UPDATE SET count = invoice_counters.count + 1
    RETURNING count
  `;

  const count = rows[0].count;
  return `FACT-${year}-${String(count).padStart(6, "0")}`;
}
