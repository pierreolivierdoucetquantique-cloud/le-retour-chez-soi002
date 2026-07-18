import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import type { ApiArticle } from "../lib/types";
import { formatDateLong } from "../lib/format";

export default function Blog() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ articles: ApiArticle[] }>("/blog")
      .then((res) => setArticles(res.articles))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader
        eyebrow="Le journal"
        title="Réflexions sur le chemin du retour"
        description="Des articles courts, sans jargon, pour nourrir votre parcours entre deux séances."
      />

      <section className="py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          {isLoading && <p className="text-stone-light">Chargement...</p>}
          {!isLoading && articles.length === 0 && (
            <p className="text-stone-light">Aucun article publié pour le moment.</p>
          )}
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            {articles.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              >
                <Link to={`/blog/${a.slug}`} className="group block">
                  <div className="aspect-[4/3] rounded-2xl bg-sand mb-5" />
                  <span className="label-eyebrow text-gold">
                    {a.publishedAt ? formatDateLong(a.publishedAt) : ""}
                  </span>
                  <h2 className="mt-2 text-xl text-wood-deep group-hover:text-sage-deep transition-colors leading-snug">
                    {a.title}
                  </h2>
                  <p className="mt-2 text-[0.92rem] text-stone leading-relaxed">{a.excerpt}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
