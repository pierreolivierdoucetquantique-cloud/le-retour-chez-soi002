import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { api, ApiError } from "../lib/api";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await api.post("/contact", {
        name: form.get("name"),
        email: form.get("email"),
        subject: form.get("subject"),
        message: form.get("message"),
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Impossible d'envoyer le message pour le moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        eyebrow="Contact"
        title="Une question ? Écrivez-nous"
        description="Nous répondons généralement en moins de 48 heures ouvrables."
      />

      <section className="py-24 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-10 grid md:grid-cols-[0.8fr_1.2fr] gap-16">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <Mail size={20} className="text-sage-deep mt-1 shrink-0" />
              <div>
                <p className="font-label text-sm uppercase tracking-[0.08em] text-stone-light">
                  Courriel
                </p>
                <p className="mt-1 text-wood-deep">
                  bonjour@leretourchezsoi.ca
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone size={20} className="text-sage-deep mt-1 shrink-0" />
              <div>
                <p className="font-label text-sm uppercase tracking-[0.08em] text-stone-light">
                  Téléphone
                </p>
                <p className="mt-1 text-wood-deep">418 555-0142</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-sage-deep mt-1 shrink-0" />
              <div>
                <p className="font-label text-sm uppercase tracking-[0.08em] text-stone-light">
                  Studio
                </p>
                <p className="mt-1 text-wood-deep">
                  Québec, QC — adresse transmise à la réservation
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {sent ? (
              <div className="rounded-2xl bg-beige p-10 text-center">
                <p className="text-2xl font-display text-wood-deep">
                  Message envoyé
                </p>
                <p className="mt-3 text-stone">
                  Merci de nous avoir écrit — nous vous répondrons bientôt.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <p className="rounded-xl bg-wood/10 text-wood-deep text-sm px-4 py-3">
                    {error}
                  </p>
                )}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
                      Nom
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
                      Courriel
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
                    Sujet
                  </label>
                  <select
                    name="subject"
                    className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors"
                  >
                    <option>Question générale</option>
                    <option>Réservation</option>
                    <option>Facturation</option>
                    <option>Partenariat</option>
                  </select>
                </div>
                <div>
                  <label className="font-label text-xs uppercase tracking-[0.08em] text-stone-light">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    name="message"
                    className="mt-2 w-full rounded-xl bg-beige border border-transparent px-4 py-3 text-sm focus:outline-none focus:border-sage-deep transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-sage-deep text-warmwhite px-8 py-3.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Envoi..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
