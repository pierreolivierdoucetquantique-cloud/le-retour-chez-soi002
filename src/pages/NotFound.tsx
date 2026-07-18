import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import BreathingOrb from "../components/BreathingOrb";

export default function NotFound() {
  return (
    <Layout>
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-24">
        <div className="w-40 h-40 mb-8">
          <BreathingOrb className="w-full h-full" />
        </div>
        <span className="label-eyebrow text-sage-deep">Page introuvable</span>
        <h1 className="mt-3 text-3xl md:text-4xl max-w-md">
          Ce chemin ne mène nulle part — pour l'instant
        </h1>
        <Link
          to="/"
          className="mt-8 rounded-full bg-sage-deep text-warmwhite px-7 py-3.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors"
        >
          Retour à l'accueil
        </Link>
      </section>
    </Layout>
  );
}
