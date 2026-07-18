import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/tableau-de-bord");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Impossible de créer le compte pour le moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center pt-32 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <span className="label-eyebrow text-sage-deep">Bienvenue</span>
            <h1 className="mt-3 text-3xl">Créer un compte</h1>
          </div>

          {error && (
            <p className="mb-5 rounded-xl bg-wood/10 text-wood-deep text-sm px-4 py-3">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
                Mot de passe
              </label>
              <input
                required
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={form.password}
                onChange={update("password")}
                className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
              />
              <p className="mt-1.5 text-xs text-stone-light">8 caractères minimum</p>
            </div>
            <label className="flex items-start gap-2.5 text-xs text-stone pt-1">
              <input required type="checkbox" className="mt-0.5" />
              <span>
                J'accepte les{" "}
                <Link to="/conditions" className="text-sage-deep hover:underline">
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link to="/confidentialite" className="text-sage-deep hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-sage-deep text-warmwhite py-3.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone">
            Déjà membre ?{" "}
            <Link to="/connexion" className="text-sage-deep hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}
