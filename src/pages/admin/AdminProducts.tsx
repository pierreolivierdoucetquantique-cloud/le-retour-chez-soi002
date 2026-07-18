import { useEffect, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { api, ApiError } from "../../lib/api";
import type { ApiProduct } from "../../lib/types";
import { formatPriceCents } from "../../lib/format";

type FormState = {
  id: string | null;
  slug: string;
  title: string;
  description: string;
  priceDollars: string;
  type: ApiProduct["type"];
  stock: string;
};

const EMPTY_FORM: FormState = {
  id: null,
  slug: "",
  title: "",
  description: "",
  priceDollars: "",
  type: "digital",
  stock: "",
};

const inputClass =
  "w-full rounded-xl bg-panel border border-warmwhite/10 px-4 py-2.5 text-sm text-warmwhite focus:outline-none focus:border-sage-deep transition-colors";

const TYPE_LABELS: Record<ApiProduct["type"], string> = {
  physical: "Produit physique",
  digital: "Produit numérique",
  course: "Formation",
  gift_card: "Carte-cadeau",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    api
      .get<{ products: ApiProduct[] }>("/products/admin/all")
      .then((res) => setProducts(res.products))
      .catch(() => setError("Impossible de charger les produits."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openEdit = (p: ApiProduct) =>
    setForm({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description ?? "",
      priceDollars: (p.priceCents / 100).toString(),
      type: p.type,
      stock: p.stock !== null ? String(p.stock) : "",
    });

  const handleSubmit = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priceCents: Math.round(Number(form.priceDollars) * 100),
        type: form.type,
        stock: form.stock ? Math.round(Number(form.stock)) : undefined,
      };
      if (form.id) {
        await api.patch(`/products/${form.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setForm(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer le produit.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: ApiProduct) => {
    try {
      await api.patch(`/products/${p.id}`, { isActive: !p.isActive } as never);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de mettre à jour ce produit.");
    }
  };

  return (
    <AdminLayout title="Boutique" description="Gérer les produits, formations et cartes-cadeaux.">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setForm(EMPTY_FORM)}
          className="flex items-center gap-2 rounded-full bg-sage-deep text-warmwhite px-5 py-2.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors"
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}

      {form && (
        <div className="glass bg-panel border border-warmwhite/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl text-wood-deep">{form.id ? "Modifier le produit" : "Nouveau produit"}</h2>
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
                Slug (URL)
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ApiProduct["type"] })}
                className={inputClass}
              >
                <option value="digital">Produit numérique</option>
                <option value="physical">Produit physique</option>
                <option value="course">Formation</option>
                <option value="gift_card">Carte-cadeau</option>
              </select>
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Prix (dollars)
              </label>
              <input
                type="number"
                value={form.priceDollars}
                onChange={(e) => setForm({ ...form, priceDollars: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Stock (vide = illimité)
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
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
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Prix</th>
                <th className="text-left px-5 py-3">Statut</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmwhite/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 text-wood-deep">{p.title}</td>
                  <td className="px-5 py-3 text-stone">{TYPE_LABELS[p.type]}</td>
                  <td className="px-5 py-3 text-stone">{formatPriceCents(p.priceCents)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`text-xs font-label px-2.5 py-1 rounded-full ${
                        p.isActive ? "bg-sage-deep/15 text-sage-deep" : "bg-wood/15 text-wood"
                      }`}
                    >
                      {p.isActive ? "Actif" : "Désactivé"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => openEdit(p)} className="text-stone hover:text-sage-deep">
                        <Pencil size={16} />
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
