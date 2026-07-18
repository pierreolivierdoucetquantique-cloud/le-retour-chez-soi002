import { motion } from "framer-motion";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Newsletter from "../components/Newsletter";

const values = [
  {
    title: "Authenticité",
    text: "Aucun discours préfabriqué. Chaque accompagnement part de qui vous êtes réellement.",
  },
  {
    title: "Sécurité",
    text: "Un espace sans jugement, où le rythme et les limites de chacun sont respectés.",
  },
  {
    title: "Ancrage",
    text: "Des pratiques concrètes, expliquées simplement, sans mysticisme ni promesses vagues.",
  },
];

export default function About() {
  return (
    <Layout>
      <PageHeader
        eyebrow="À propos"
        title="Une équipe humaine, un lieu ancré"
        description="Le Retour Chez Soi est né du désir de créer un espace où ralentir devient possible, entre coaching, travail énergétique et communauté."
      />

      <section className="py-24 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-lg leading-relaxed text-stone"
          >
            Tout a commencé par un constat simple : beaucoup de personnes
            avancent en pilote automatique, coupées de leurs besoins réels.
            Le Retour Chez Soi accompagne ce chemin de reconnexion — à son
            corps, à ses choix, à son propre rythme — par des outils concrets
            plutôt que des promesses.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-lg leading-relaxed text-stone"
          >
            Notre équipe réunit des praticien·nes formé·es en coaching, en
            approches énergétiques et en accompagnement de groupe, réunis
            autour d'une même conviction : la transformation durable se
            construit pas à pas, jamais dans l'urgence.
          </motion.p>
        </div>
      </section>

      <section className="bg-beige py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <span className="label-eyebrow text-sage-deep">Nos valeurs</span>
          <h2 className="mt-3 text-3xl md:text-4xl mb-14 max-w-lg">
            Ce qui guide chaque accompagnement
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass bg-panel rounded-2xl p-8 border border-warmwhite/10"
              >
                <h3 className="text-2xl text-wood-deep">{v.title}</h3>
                <p className="mt-3 text-stone leading-relaxed">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </Layout>
  );
}
