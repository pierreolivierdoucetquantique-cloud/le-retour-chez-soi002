import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/tableau-de-bord");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Impossible de se connecter pour le moment."
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
            <span className="label-eyebrow text-sage-deep">Bon retour</span>
            <h1 className="mt-3 text-3xl">Connexion</h1>
          </div>

          {error && (
            <p className="mb-5 rounded-xl bg-wood/10 text-wood-deep text-sm px-4 py-3">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
                Courriel
              </label>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
                  Mot de passe
                </label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs text-sage-deep hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-sage-deep text-warmwhite py-3.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-sage-deep hover:underline">
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}
