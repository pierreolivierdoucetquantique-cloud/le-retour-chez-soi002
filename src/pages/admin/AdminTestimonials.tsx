import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { api, ApiError } from "../../lib/api";
import type { ApiTestimonial } from "../../lib/types";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<(ApiTestimonial & { isApproved: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    api
      .get<{ testimonials: (ApiTestimonial & { isApproved: boolean })[] }>("/testimonials/admin/all")
      .then((res) => setTestimonials(res.testimonials))
      .catch(() => setError("Impossible de charger les témoignages."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const approve = async (id: string) => {
    try {
      await api.patch(`/testimonials/${id}/approve`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'approuver ce témoignage.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de supprimer ce témoignage.");
    }
  };

  const pending = testimonials.filter((t) => !t.isApproved);
  const approved = testimonials.filter((t) => t.isApproved);

  return (
    <AdminLayout
      title="Témoignages"
      description="Approuver les témoignages soumis avant qu'ils n'apparaissent publiquement."
    >
      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}
      {isLoading ? (
        <p className="text-stone-light">Chargement...</p>
      ) : (
        <>
          <h2 className="text-xl text-wood-deep mb-4">
            En attente d'approbation {pending.length > 0 && `(${pending.length})`}
          </h2>
          {pending.length === 0 ? (
            <p className="text-stone-light mb-10">Aucun témoignage en attente.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {pending.map((t) => (
                <div key={t.id} className="glass bg-panel border border-warmwhite/10 rounded-2xl p-6">
                  <p className="font-display italic text-wood-deep leading-relaxed">« {t.quote} »</p>
                  <div className="mt-4 flex items-center justify-between">
                    <cite className="not-italic font-label text-sm uppercase tracking-[0.08em] text-stone">
                      {t.name}
                    </cite>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(t.id)}
                        className="flex items-center gap-1.5 rounded-full bg-sage-deep/15 text-sage-deep px-3 py-1.5 text-xs font-label hover:bg-sage-deep/25 transition-colors"
                      >
                        <Check size={14} /> Approuver
                      </button>
                      <button
                        onClick={() => remove(t.id)}
                        className="flex items-center gap-1.5 rounded-full bg-wood/15 text-wood px-3 py-1.5 text-xs font-label hover:bg-wood/25 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl text-wood-deep mb-4">Publiés ({approved.length})</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {approved.map((t) => (
              <div key={t.id} className="rounded-2xl border border-warmwhite/10 p-6">
                <p className="font-display italic text-wood-deep leading-relaxed">« {t.quote} »</p>
                <div className="mt-4 flex items-center justify-between">
                  <cite className="not-italic font-label text-sm uppercase tracking-[0.08em] text-stone">
                    {t.name}
                  </cite>
                  <button
                    onClick={() => remove(t.id)}
                    className="text-stone hover:text-wood"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
