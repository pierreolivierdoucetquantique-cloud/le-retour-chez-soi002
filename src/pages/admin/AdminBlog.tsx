import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { api, ApiError } from "../../lib/api";
import type { ApiArticle } from "../../lib/types";
import { formatDateLong } from "../../lib/format";

type FormState = {
  id: string | null;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: "draft" | "published";
};

const EMPTY_FORM: FormState = {
  id: null,
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: "",
  status: "draft",
};

const inputClass =
  "w-full rounded-xl bg-panel border border-warmwhite/10 px-4 py-2.5 text-sm text-warmwhite focus:outline-none focus:border-sage-deep transition-colors";

export default function AdminBlog() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    api
      .get<{ articles: ApiArticle[] }>("/blog/admin/all")
      .then((res) => setArticles(res.articles))
      .catch(() => setError("Impossible de charger les articles."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openEdit = (a: ApiArticle) =>
    setForm({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category ?? "",
      status: a.status,
    });

  const handleSubmit = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category.trim() || undefined,
        status: form.status,
      };
      if (form.id) {
        await api.patch(`/blog/${form.id}`, payload);
      } else {
        await api.post("/blog", payload);
      }
      setForm(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer l'article.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cet article ?")) return;
    try {
      await api.delete(`/blog/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de supprimer cet article.");
    }
  };

  return (
    <AdminLayout title="Blog" description="Rédiger, publier et gérer les articles du journal.">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setForm(EMPTY_FORM)}
          className="flex items-center gap-2 rounded-full bg-sage-deep text-warmwhite px-5 py-2.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors"
        >
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}

      {form && (
        <div className="glass bg-panel border border-warmwhite/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl text-wood-deep">{form.id ? "Modifier l'article" : "Nouvel article"}</h2>
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
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Catégorie
              </label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
                Statut
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                className={inputClass}
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
              Extrait
            </label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="mt-4">
            <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light block mb-1.5">
              Contenu
            </label>
            <textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
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
                <th className="text-left px-5 py-3">Statut</th>
                <th className="text-left px-5 py-3">Publié le</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmwhite/10">
              {articles.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 text-wood-deep">{a.title}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-label px-2.5 py-1 rounded-full ${
                        a.status === "published"
                          ? "bg-sage-deep/15 text-sage-deep"
                          : "bg-gold/15 text-gold"
                      }`}
                    >
                      {a.status === "published" ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-stone">
                    {a.publishedAt ? formatDateLong(a.publishedAt) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(a)} className="text-stone hover:text-sage-deep">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="text-stone hover:text-wood">
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
