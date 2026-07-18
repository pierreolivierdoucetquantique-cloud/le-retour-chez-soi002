import { useState, type FormEvent } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";

export default function DashboardProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      });
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      setSuccess("Votre profil a été mis à jour.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de mettre à jour le profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-xl text-wood-deep mb-4">Mon profil</h2>

      {error && (
        <p className="mb-5 rounded-xl bg-wood/10 text-wood-deep text-sm px-4 py-3">{error}</p>
      )}
      {success && (
        <p className="mb-5 rounded-xl bg-sage-deep/10 text-sage-deep text-sm px-4 py-3">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
              Prénom
            </label>
            <input
              required
              type="text"
              value={form.firstName}
              onChange={update("firstName")}
              className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
            />
          </div>
          <div>
            <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
              Nom
            </label>
            <input
              required
              type="text"
              value={form.lastName}
              onChange={update("lastName")}
              className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
            Courriel
          </label>
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
          />
        </div>

        <div className="pt-4 border-t border-stone/10">
          <p className="font-label text-xs uppercase tracking-[0.08em] text-stone-light mb-3">
            Changer de mot de passe (optionnel)
          </p>
          <div className="space-y-3">
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Mot de passe actuel"
              value={form.currentPassword}
              onChange={update("currentPassword")}
              className="w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
            />
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Nouveau mot de passe"
              value={form.newPassword}
              onChange={update("newPassword")}
              className="w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-full bg-sage-deep text-warmwhite px-6 py-3.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </DashboardLayout>
  );
}
