import { motion } from "framer-motion";
import BreathingOrb from "./BreathingOrb";

export default function Hero() {
  return (
    <section className="relative min-h-[92svh] flex items-center overflow-hidden pt-24">

      <div className="relative max-w-7xl mx-auto w-full px-6 md:px-10 grid md:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <span className="label-eyebrow text-sage-deep">
            Coaching · Énergie · Communauté
          </span>

          <h1 className="mt-5 text-[2.75rem] leading-[1.08] md:text-[4.2rem] md:leading-[1.05] text-wood-deep">
            Le retour
            <br />
            <span className="italic text-sage-deep">chez soi.</span>
          </h1>

          <p className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-stone">
            Un espace pour ralentir, se réaligner et grandir — par le
            coaching, le travail énergétique et une communauté qui
            accompagne chaque étape du chemin.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/services"
              className="rounded-full bg-sage-deep text-warmwhite px-7 py-3.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors"
            >
              Découvrir les services
            </a>
            <a
              href="/a-propos"
              className="rounded-full border border-warmwhite/25 px-7 py-3.5 font-label text-sm uppercase tracking-[0.1em] text-stone hover:border-sage-deep hover:text-sage-deep transition-colors"
            >
              Notre mission
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
          className="relative aspect-square w-full max-w-[440px] mx-auto"
        >
          <BreathingOrb className="w-full h-full" />
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-light"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="label-eyebrow text-[0.62rem]">Découvrir</span>
        <div className="w-px h-8 bg-stone-light/50" />
      </motion.div>
    </section>
  );
}
