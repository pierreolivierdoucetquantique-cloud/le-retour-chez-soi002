import { motion } from "framer-motion";

export default function MissionTeaser() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-[1.5rem] md:text-[2rem] leading-[1.5] font-display text-wood-deep"
        >
          Nous croyons que la transformation ne se force pas —
          <span className="text-sage-deep italic"> elle se cultive</span>,
          une respiration, une séance, une décision à la fois.
        </motion.p>

        <motion.a
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          href="/notre-mission"
          className="inline-block mt-8 font-label text-sm uppercase tracking-[0.1em] text-sage-deep border-b border-sage-deep/40 pb-1 hover:border-sage-deep transition-colors"
        >
          Lire notre mission
        </motion.a>
      </div>
    </section>
  );
}
