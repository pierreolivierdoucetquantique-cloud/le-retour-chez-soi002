import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import type { ApiTestimonial } from "../lib/types";

export default function TestimonialsPreview() {
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);

  useEffect(() => {
    api
      .get<{ testimonials: ApiTestimonial[] }>("/testimonials")
      .then((res) => setTestimonials(res.testimonials.slice(0, 3)))
      .catch(() => setTestimonials([]));
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <span className="label-eyebrow text-sage-deep">Témoignages</span>
        <h2 className="mt-3 text-3xl md:text-4xl mb-14 max-w-xl">
          Ce que vivent les personnes accompagnées
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-2xl bg-sand/40 p-8 flex flex-col"
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
  );
}
