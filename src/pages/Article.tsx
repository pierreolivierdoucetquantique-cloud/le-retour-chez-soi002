import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import Newsletter from "../components/Newsletter";
import { api } from "../lib/api";
import type { ApiArticle } from "../lib/types";
import { formatDateLong } from "../lib/format";

export default function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [others, setOthers] = useState<ApiArticle[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<{ article: ApiArticle }>(`/blog/${slug}`)
      .then((res) => setArticle(res.article))
      .catch(() => setNotFound(true));

    api
      .get<{ articles: ApiArticle[] }>("/blog")
      .then((res) => setOthers(res.articles.filter((a) => a.slug !== slug).slice(0, 2)))
      .catch(() => {});
  }, [slug]);

  if (notFound) return <Navigate to="/blog" replace />;
  if (!article) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-stone-light pt-32">
          Chargement...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="pt-40 pb-20 md:pt-48">
        <div className="max-w-2xl mx-auto px-6 md:px-10">
          <Link
            to="/blog"
            className="font-label text-sm uppercase tracking-[0.1em] text-stone hover:text-sage-deep transition-colors"
          >
            ← Le journal
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="label-eyebrow text-gold block mt-6">
              {article.publishedAt ? formatDateLong(article.publishedAt) : ""}
            </span>
            <h1 className="mt-3 text-3xl md:text-4xl leading-tight">{article.title}</h1>
          </motion.div>

          <div className="aspect-video rounded-2xl bg-sand my-10" />

          <div className="prose-content text-stone leading-[1.85] space-y-6 text-[1.05rem]">
            <p>{article.excerpt}</p>
            <p>{article.content}</p>
            <p>
              Si ce sujet résonne avec ce que vous vivez en ce moment, n'hésitez pas à{" "}
              <Link to="/contact" className="text-sage-deep underline underline-offset-2">
                nous écrire
              </Link>{" "}
              ou à explorer nos{" "}
              <Link to="/services" className="text-sage-deep underline underline-offset-2">
                services d'accompagnement
              </Link>
              .
            </p>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="bg-beige py-20">
          <div className="max-w-2xl mx-auto px-6 md:px-10">
            <span className="label-eyebrow text-sage-deep">À lire aussi</span>
            <div className="mt-6 grid sm:grid-cols-2 gap-6">
              {others.map((a) => (
                <Link
                  key={a.id}
                  to={`/blog/${a.slug}`}
                  className="rounded-2xl glass bg-panel border border-warmwhite/10 hover:border-sage-deep/50 transition-colors"
                >
                  <span className="label-eyebrow text-gold">
                    {a.publishedAt ? formatDateLong(a.publishedAt) : ""}
                  </span>
                  <h3 className="mt-2 text-lg text-wood-deep leading-snug">{a.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Newsletter />
    </Layout>
  );
}
