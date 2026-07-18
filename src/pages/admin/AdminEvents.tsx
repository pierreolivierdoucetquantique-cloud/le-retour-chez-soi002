import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { api, ApiError } from "../../lib/api";
import type { ApiEvent } from "../../lib/types";
import { formatDateLong } from "../../lib/format";

type FormState = {
  id: string | null;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  capacity: string;
  priceDollars: string;
};

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  description: "",
  location: "",
  startsAt: "",
  capacity: "",
  priceDollars: "0",
};

const inputClass =
  "w-full rounded-xl bg-panel border border-warmwhite/10 px-4 py-2.5 text-sm text-warmwhite focus:outline-none focus:border-sage-deep transition-colors";

function toDatetimeLocal(iso: string) {
  return iso.slice(0, 16);
}

export default function AdminEvents() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    api
      .get<{ events: ApiEvent[] }>("/events/admin/all")
      .then((res) => setEvents(res.events))
      .catch(() => setError("Impossible de charger les événements."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openEdit = (e: ApiEvent) =>
    setForm({
      id: e.id,
      title: e.title,
      description: e.description ?? "",
      location: e.location,
      startsAt: toDatetimeLocal(e.startsAt),
      capacity: e.capacity ? String(e.capacity) : "",
      priceDollars: e.priceCents ? (e.priceCents / 100).toString() : "0",
    });

  const handleSubmit = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim(),
        startsAt: new Date(form.startsAt).toISOString(),
        capacity: form.capacity ? Math.round(Number(form.capacity)) : undefined,
        priceCents: Math.round(Number(form.priceDollars || "0") * 100),
      };
      if (form.id) {
        await api.patch(`/events/${form.id}`, payload);
      } else {
        await api.post("/events", payload);
      }
      setForm(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer l'événement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cet événement ?")) return;
    try {
      await api.delete(`/events/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de supprimer cet événement.");
    }
  };

  return (
    <AdminLayout title="Événements" description="Créer et gérer les cercles, ateliers et retraites.">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setForm(EMPTY_FORM)}
          className="flex items-center gap-2 rounded-full bg-sage-deep text-warmwhite px-5 py-2.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors"
        >
          <Plus size={16} /> Nouvel événement
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}

      {form && (
        <div className="glass bg-panel border border-warmwhite/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl text-wood-deep">
              {form.id ? "Modifier l'événement" : "Nouvel événement"}
            </h2>
            <button onClick={() => setForm(null)} className="text-stone-light hover:text-warmwhite">
              <X size={20} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Titre
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Lieu
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Date et heure
              </label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Capacité (optionnel)
              </label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Prix (dollars, 0 si gratuit)
              </label>
              <input
                type="number"
                value={form.priceDollars}
                onChange={(e) => setForm({ ...form, priceDollars: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-6 rounded-full bg-sage-deep text-warmwhite px-6 py-3 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-stone-light">Chargement...</p>
      ) : (
        <div className="rounded-2xl border border-warmwhite/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-stone-light font-label text-xs uppercase tracking-[0.06em]">
              <tr>
                <th className="text-left px-5 py-3">Titre</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Lieu</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmwhite/10">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3 text-wood-deep">{e.title}</td>
                  <td className="px-5 py-3 text-stone">{formatDateLong(e.startsAt)}</td>
                  <td className="px-5 py-3 text-stone">{e.location}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(e)} className="text-stone hover:text-sage-deep">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="text-stone hover:text-wood">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
