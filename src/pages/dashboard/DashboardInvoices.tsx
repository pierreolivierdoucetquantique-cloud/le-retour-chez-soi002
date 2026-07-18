import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { api } from "../../lib/api";
import type { ApiInvoice } from "../../lib/types";
import { formatPriceCents } from "../../lib/format";
import { formatDateLong } from "../../lib/format";

const STATUS_LABELS: Record<ApiInvoice["status"], string> = {
  pending: "En attente",
  paid: "Payée",
  refunded: "Remboursée",
  partial: "Partielle",
};

const STATUS_STYLES: Record<ApiInvoice["status"], string> = {
  pending: "bg-stone/10 text-stone",
  paid: "bg-sage-deep/15 text-sage-deep",
  refunded: "bg-wood/15 text-wood",
  partial: "bg-beige text-wood-deep",
};

export default function DashboardInvoices() {
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ invoices: ApiInvoice[] }>("/invoices")
      .then((res) => setInvoices(res.invoices))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-xl text-wood-deep mb-4">Mes factures</h2>

      {isLoading && <p className="text-stone-light">Chargement...</p>}

      {!isLoading && invoices.length === 0 && (
        <p className="text-stone-light">Vous n'avez aucune facture pour le moment.</p>
      )}

      {invoices.length > 0 && (
        <div className="divide-y divide-stone/10 rounded-2xl border border-stone/10 overflow-hidden">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5">
              <div>
                <p className="text-wood-deep">
                  {inv.number} <span className="text-stone-light">— {inv.description}</span>
                </p>
                <p className="text-sm text-stone-light mt-0.5">{formatDateLong(inv.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-label px-2.5 py-1 rounded-full ${STATUS_STYLES[inv.status]}`}
                >
                  {STATUS_LABELS[inv.status]}
                </span>
                <span className="text-wood-deep font-label">{formatPriceCents(inv.totalCents)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
