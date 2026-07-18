import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import type { ApiArticle } from "../lib/types";
import { formatDateShort } from "../lib/format";

export default function LatestArticles() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);

  useEffect(() => {
    api
      .get<{ articles: ApiArticle[] }>("/blog")
      .then((res) => setArticles(res.articles.slice(0, 3)))
      .catch(() => setArticles([]));
  }, []);

  if (articles.length === 0) return null;

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <span className="label-eyebrow text-sage-deep">Le journal</span>
            <h2 className="mt-3 text-3xl md:text-4xl">Derniers articles</h2>
          </div>
          <a
            href="/blog"
            className="font-label text-sm uppercase tracking-[0.1em] text-stone hover:text-sage-deep transition-colors"
          >
            Voir le blogue →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((a, i) => (
            <motion.a
              key={a.id}
              href={`/blog/${a.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group"
            >
              <div className="aspect-[4/3] rounded-2xl bg-sand overflow-hidden mb-5" />
              <span className="label-eyebrow text-gold">
                {a.publishedAt ? formatDateShort(a.publishedAt) : ""}
              </span>
              <h3 className="mt-2 text-xl text-wood-deep group-hover:text-sage-deep transition-colors leading-snug">
                {a.title}
              </h3>
              <p className="mt-2 text-[0.92rem] text-stone leading-relaxed">{a.excerpt}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
