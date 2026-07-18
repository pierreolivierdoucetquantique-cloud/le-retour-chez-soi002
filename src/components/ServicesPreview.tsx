import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { api } from "../lib/api";
import type { ApiService } from "../lib/types";
import { formatDurationMinutes, formatPriceCents } from "../lib/format";

export default function ServicesPreview() {
  const [services, setServices] = useState<ApiService[]>([]);

  useEffect(() => {
    api
      .get<{ services: ApiService[] }>("/services")
      .then((res) => setServices(res.services.slice(0, 3)))
      .catch(() => setServices([]));
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="bg-beige py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <span className="label-eyebrow text-sage-deep">Nos services</span>
            <h2 className="mt-3 text-3xl md:text-4xl">
              Trois chemins vers l'équilibre
            </h2>
          </div>
          <a
            href="/services"
            className="font-label text-sm uppercase tracking-[0.1em] text-stone hover:text-sage-deep transition-colors"
          >
            Voir tous les services →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.a
              key={s.id}
              href={`/services/${s.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group glass bg-panel rounded-2xl p-8 border border-warmwhite/10 hover:border-sage-deep/50 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)] transition-all flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span className="label-eyebrow text-gold">
                  {formatDurationMinutes(s.durationMinutes)}
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-stone-light group-hover:text-sage-deep group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </div>
              <h3 className="mt-5 text-2xl text-wood-deep">{s.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-stone flex-1">
                {s.description}
              </p>
              <span className="mt-6 font-label text-sm text-sage-deep">
                {formatPriceCents(s.priceCents)}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
