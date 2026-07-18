import { motion } from "framer-motion";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import BreathingOrb from "../components/BreathingOrb";

const pillars = [
  {
    title: "Ralentir",
    text: "Offrir des espaces où il est permis de ne rien performer, simplement être.",
  },
  {
    title: "Reconnecter",
    text: "Redonner accès aux signaux du corps souvent ignorés dans le quotidien.",
  },
  {
    title: "Avancer",
    text: "Transformer la prise de conscience en actions concrètes et durables.",
  },
];

export default function Mission() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Notre mission"
        title={
          <>
            Créer un chemin de retour,
            <br className="hidden md:block" /> pas une destination
          </>
        }
      />

      <section className="py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-[1fr_0.8fr] gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-lg leading-relaxed text-stone">
              Nous ne croyons pas aux transformations instantanées. Notre
              mission est d'offrir un accompagnement progressif, humain et
              honnête — qui respecte le fait que chaque personne avance à son
              propre rythme, avec son histoire, ses limites et ses forces.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-stone">
              Concrètement, cela veut dire des séances sans formule magique,
              des outils qu'on peut réellement utiliser au quotidien, et une
              communauté qui accompagne sans jamais comparer les parcours.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="aspect-square max-w-[320px] mx-auto w-full"
          >
            <BreathingOrb className="w-full h-full" />
          </motion.div>
        </div>
      </section>

      <section className="bg-sage-deep py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <span className="label-eyebrow text-gold">Nos trois piliers</span>
          <h2 className="mt-3 text-3xl md:text-4xl text-warmwhite mb-14 max-w-lg">
            Comment nous mettons cette mission en pratique
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border-t border-warmwhite/20 pt-6"
              >
                <h3 className="text-2xl text-warmwhite">{p.title}</h3>
                <p className="mt-3 text-warmwhite/70 leading-relaxed">
                  {p.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
