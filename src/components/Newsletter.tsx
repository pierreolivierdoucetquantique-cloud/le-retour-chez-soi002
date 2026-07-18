import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { api, ApiError } from "../lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post("/newsletter", { email });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Impossible de vous inscrire pour le moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-beige py-24 md:py-28">
      <div className="max-w-2xl mx-auto px-6 md:px-10 text-center">
        <span className="label-eyebrow text-sage-deep">Infolettre</span>
        <h2 className="mt-3 text-3xl md:text-4xl">
          Restez connecté au chemin du retour
        </h2>
        <p className="mt-4 text-stone leading-relaxed">
          Recevez, une fois par mois, une réflexion, un événement à venir et
          une invitation à ralentir.
        </p>

        {sent ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 font-label text-sage-deep"
          >
            Merci — votre inscription est confirmée.
          </motion.p>
        ) : (
          <>
            {error && <p className="mt-6 text-sm text-wood-deep">{error}</p>}
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre courriel"
                className="flex-1 rounded-full bg-panel border border-warmwhite/15 px-5 py-3.5 text-sm text-warmwhite placeholder:text-stone-light focus:outline-none focus:border-sage-deep transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-sage-deep text-warmwhite px-7 py-3.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "..." : "S'inscrire"}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
