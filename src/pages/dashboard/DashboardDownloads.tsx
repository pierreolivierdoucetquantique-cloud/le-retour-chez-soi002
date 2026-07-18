import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { api, downloadFile, ApiError } from "../../lib/api";
import type { ApiInvoice } from "../../lib/types";
import { formatPriceCents, formatDateLong } from "../../lib/format";

export default function DashboardDownloads() {
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ invoices: ApiInvoice[] }>("/invoices")
      .then((res) => setInvoices(res.invoices))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownload = async (invoice: ApiInvoice) => {
    setDownloadingId(invoice.id);
    setError(null);
    try {
      await downloadFile(`/invoices/${invoice.id}/pdf`, `${invoice.number}.pdf`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de télécharger ce document.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-xl text-wood-deep mb-4">Téléchargements</h2>
      <p className="text-sm text-stone-light mb-6">
        Téléchargez le reçu PDF de chacune de vos factures.
      </p>

      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}
      {isLoading && <p className="text-stone-light">Chargement...</p>}

      {!isLoading && invoices.length === 0 && (
        <p className="text-stone-light">Aucun document disponible pour le moment.</p>
      )}

      {invoices.length > 0 && (
        <div className="divide-y divide-stone/10 rounded-2xl border border-stone/10 overflow-hidden">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
              <div>
                <p className="text-wood-deep">
                  {inv.number} <span className="text-stone-light">— {inv.description}</span>
                </p>
                <p className="text-sm text-stone-light mt-0.5">
                  {formatDateLong(inv.createdAt)} · {formatPriceCents(inv.totalCents)}
                </p>
              </div>
              <button
                onClick={() => handleDownload(inv)}
                disabled={downloadingId === inv.id}
                className="flex items-center gap-2 text-sm font-label rounded-full border border-stone/20 px-4 py-2 hover:border-sage-deep hover:text-sage-deep transition-colors disabled:opacity-50 w-fit"
              >
                <Download size={15} />
                {downloadingId === inv.id ? "Téléchargement..." : "Télécharger PDF"}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
