import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <section className="bg-beige pt-40 pb-20 md:pt-48 md:pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="label-eyebrow text-sage-deep">{eyebrow}</span>
          <h1 className="mt-4 text-4xl md:text-5xl">{title}</h1>
          {description && (
            <p className="mt-5 max-w-xl mx-auto text-stone leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
