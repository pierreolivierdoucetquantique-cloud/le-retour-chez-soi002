import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ApiProduct } from "../lib/types";
import { formatPriceCents } from "../lib/format";

const TYPE_LABELS: Record<ApiProduct["type"], string> = {
  physical: "Produit physique",
  digital: "Produit numérique",
  course: "Formation",
  gift_card: "Carte-cadeau",
};

export default function Shop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(
    searchParams.get("commande") === "succes"
      ? "Votre paiement a été reçu. Un reçu vous sera envoyé par courriel."
      : searchParams.get("commande") === "annulee"
        ? "Le paiement a été annulé. Votre commande reste enregistrée si vous souhaitez réessayer."
        : null
  );

  useEffect(() => {
    api
      .get<{ products: ApiProduct[] }>("/products")
      .then((res) => setProducts(res.products))
      .catch(() => setProducts([]));
  }, []);

  const addToCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotalCents = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((p) => p.id === id);
    return sum + (p ? p.priceCents * qty : 0);
  }, 0);

  const checkout = async () => {
    if (!user) {
      navigate("/connexion");
      return;
    }
    setCheckingOut(true);
    setError(null);
    try {
      const res = await api.post<{
        payment: { redirectUrl: string | null; instructions: string };
      }>("/orders", {
        items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
        paymentMethod: "stripe",
      });

      if (res.payment.redirectUrl) {
        window.location.href = res.payment.redirectUrl;
        return;
      }

      setResult(res.payment.instructions);
      setCart({});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de finaliser la commande.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        eyebrow="Boutique"
        title="Formations, produits et cartes-cadeaux"
        description="Paiement sécurisé par Stripe ou Interac. Les produits numériques sont accessibles immédiatement après l'achat."
      />

      <section className="py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          {result && (
            <div className="mb-10 rounded-2xl bg-beige p-6 text-stone">
              <p className="font-display text-xl text-wood-deep mb-1">Commande enregistrée</p>
              <p>{result}</p>
            </div>
          )}
          {error && <p className="mb-6 text-wood-deep">{error}</p>}

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                className="group"
              >
                <div className="aspect-square rounded-2xl bg-sand mb-4" />
                <span className="label-eyebrow text-gold">{TYPE_LABELS[p.type]}</span>
                <h2 className="mt-1.5 text-lg text-wood-deep leading-snug">{p.title}</h2>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-label text-sm text-sage-deep">
                    {formatPriceCents(p.priceCents)}
                  </span>
                  <button
                    onClick={() => addToCart(p.id)}
                    className="text-xs font-label uppercase tracking-[0.08em] rounded-full border border-stone/20 px-4 py-2 hover:border-sage-deep hover:text-sage-deep transition-colors"
                  >
                    {cart[p.id] ? `Ajouté (${cart[p.id]})` : "Ajouter"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-night border border-warmwhite/10 text-warmwhite rounded-full pl-6 pr-2 py-2 flex items-center gap-4 shadow-lg">
          <span className="font-label text-sm">
            {cartCount} article{cartCount > 1 ? "s" : ""} — {formatPriceCents(cartTotalCents)}
          </span>
          <button
            onClick={checkout}
            disabled={checkingOut}
            className="rounded-full bg-sage-deep px-5 py-2.5 font-label text-xs uppercase tracking-[0.1em] hover:bg-sage transition-colors disabled:opacity-50"
          >
            {checkingOut ? "..." : user ? "Payer" : "Se connecter"}
          </button>
        </div>
      )}
    </Layout>
  );
}
