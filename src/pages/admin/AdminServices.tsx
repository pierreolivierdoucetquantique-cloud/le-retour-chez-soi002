import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { api, ApiError } from "../../lib/api";
import type { ApiService } from "../../lib/types";
import { formatPriceCents } from "../../lib/format";

type FormState = {
  id: string | null;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  durationMinutes: string;
  priceDollars: string;
  includes: string;
  relatedSlugs: string;
};

const EMPTY_FORM: FormState = {
  id: null,
  slug: "",
  title: "",
  description: "",
  longDescription: "",
  durationMinutes: "60",
  priceDollars: "",
  includes: "",
  relatedSlugs: "",
};

export default function AdminServices() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    api
      .get<{ services: ApiService[] }>("/services/admin/all")
      .then((res) => setServices(res.services))
      .catch(() => setError("Impossible de charger les services."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => setForm(EMPTY_FORM);

  const openEdit = (s: ApiService) =>
    setForm({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      longDescription: s.longDescription ?? "",
      durationMinutes: String(s.durationMinutes),
      priceDollars: (s.priceCents / 100).toString(),
      includes: s.includes.join("\n"),
      relatedSlugs: s.relatedSlugs.join(", "),
    });

  const handleSubmit = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        longDescription: form.longDescription.trim() || undefined,
        durationMinutes: Math.round(Number(form.durationMinutes)),
        priceCents: Math.round(Number(form.priceDollars) * 100),
        includes: form.includes
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        relatedSlugs: form.relatedSlugs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (form.id) {
        await api.patch(`/services/${form.id}`, payload);
      } else {
        await api.post("/services", payload);
      }
      setForm(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer le service.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Désactiver ce service ? Il ne sera plus visible publiquement.")) return;
    try {
      await api.delete(`/services/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de désactiver ce service.");
    }
  };

  return (
    <AdminLayout title="Services" description="Créer, modifier et désactiver les services offerts.">
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-sage-deep text-warmwhite px-5 py-2.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors"
        >
          <Plus size={16} /> Nouveau service
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}

      {form && (
        <div className="glass bg-panel border border-warmwhite/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl text-wood-deep">
              {form.id ? "Modifier le service" : "Nouveau service"}
            </h2>
            <button onClick={() => setForm(null)} className="text-stone-light hover:text-warmwhite">
              <X size={20} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field
              label="Slug (URL)"
              value={form.slug}
              onChange={(v) => setForm({ ...form, slug: v })}
              placeholder="seances-energetiques"
            />
            <Field
              label="Durée (minutes)"
              value={form.durationMinutes}
              onChange={(v) => setForm({ ...form, durationMinutes: v })}
              type="number"
            />
            <Field
              label="Prix (dollars)"
              value={form.priceDollars}
              onChange={(v) => setForm({ ...form, priceDollars: v })}
              type="number"
            />
          </div>

          <div className="mt-4">
            <FieldLabel>Description courte</FieldLabel>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="mt-4">
            <FieldLabel>Description détaillée</FieldLabel>
            <textarea
              rows={3}
              value={form.longDescription}
              onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <FieldLabel>Inclusions (une par ligne)</FieldLabel>
              <textarea
                rows={3}
                value={form.includes}
                onChange={(e) => setForm({ ...form, includes: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Services liés (slugs, séparés par virgules)</FieldLabel>
              <textarea
                rows={3}
                value={form.relatedSlugs}
                onChange={(e) => setForm({ ...form, relatedSlugs: e.target.value })}
                className={inputClass}
              />
            </div>
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
                <th className="text-left px-5 py-3">Prix</th>
                <th className="text-left px-5 py-3">Statut</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmwhite/10">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 text-wood-deep">{s.title}</td>
                  <td className="px-5 py-3 text-stone">{formatPriceCents(s.priceCents)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-label px-2.5 py-1 rounded-full ${
                        s.isActive ? "bg-sage-deep/15 text-sage-deep" : "bg-wood/15 text-wood"
                      }`}
                    >
                      {s.isActive ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(s)} className="text-stone hover:text-sage-deep">
                        <Pencil size={16} />
                      </button>
                      {s.isActive && (
                        <button
                          onClick={() => handleDeactivate(s.id)}
                          className="text-stone hover:text-wood"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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

const inputClass =
  "w-full rounded-xl bg-panel border border-warmwhite/10 px-4 py-2.5 text-sm text-warmwhite focus:outline-none focus:border-sage-deep transition-colors";

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}
