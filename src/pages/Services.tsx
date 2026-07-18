import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import type { ApiService } from "../lib/types";
import { formatDurationMinutes, formatPriceCents } from "../lib/format";

export default function Services() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ services: ApiService[] }>("/services")
      .then((res) => setServices(res.services))
      .catch(() => setError("Impossible de charger les services pour le moment."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Services"
        title="Des chemins d'accompagnement, à votre rythme"
        description="Chaque service est réservable en ligne, avec paiement sécurisé et confirmation automatique."
      />

      <section className="py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          {isLoading && <p className="text-stone-light">Chargement des services...</p>}
          {error && <p className="text-wood-deep">{error}</p>}

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((s, i) => (
              <motion.a
                key={s.id}
                href={`/services/${s.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="group bg-beige rounded-2xl p-9 hover:bg-sand/60 transition-colors flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="label-eyebrow text-gold">
                    {formatDurationMinutes(s.durationMinutes)}
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="text-stone-light group-hover:text-sage-deep group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </div>
                <h2 className="mt-5 text-2xl md:text-3xl text-wood-deep">{s.title}</h2>
                <p className="mt-3 text-stone leading-relaxed flex-1">{s.description}</p>
                <span className="mt-6 font-label text-sm text-sage-deep">
                  À partir de {formatPriceCents(s.priceCents)}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
