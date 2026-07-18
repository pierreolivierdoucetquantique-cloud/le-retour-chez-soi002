import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import type { ApiTestimonial } from "../lib/types";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ testimonials: ApiTestimonial[] }>("/testimonials")
      .then((res) => setTestimonials(res.testimonials))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Témoignages"
        title="Ce que vivent les personnes accompagnées"
        description="Partagés avec la permission de chacun·e, pour vous donner un aperçu honnête de ce chemin."
      />

      <section className="py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          {isLoading && <p className="text-stone-light">Chargement...</p>}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                className="rounded-2xl bg-beige p-8 flex flex-col"
              >
                <p className="text-[1.05rem] leading-relaxed text-wood-deep font-display italic">
                  « {t.quote} »
                </p>
                <cite className="mt-6 not-italic font-label text-sm uppercase tracking-[0.08em] text-stone">
                  {t.name}
                </cite>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
