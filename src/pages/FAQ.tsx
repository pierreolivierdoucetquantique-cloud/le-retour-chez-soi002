import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { faqs } from "../data/mockData";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Layout>
      <PageHeader
        eyebrow="Questions fréquentes"
        title="Tout ce qu'il faut savoir avant de réserver"
      />

      <section className="py-24 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10 divide-y divide-stone/10">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="py-6 first:pt-0">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg md:text-xl text-wood-deep">
                    {f.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-sage-deep transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-stone leading-relaxed pr-8">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
