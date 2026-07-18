import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  CalendarClock,
  Boxes,
  Newspaper,
  ShoppingBag,
  MessageSquareQuote,
  CalendarSync,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";

const SECTIONS = [
  { icon: Boxes, label: "Services", desc: "Catégories, tarifs, disponibilité", to: "/administration/services" },
  { icon: Newspaper, label: "Blog", desc: "Articles, brouillons, publication", to: "/administration/blog" },
  { icon: CalendarClock, label: "Événements", desc: "Cercles, ateliers, retraites", to: "/administration/evenements" },
  { icon: ShoppingBag, label: "Boutique", desc: "Produits, formations, cartes-cadeaux", to: "/administration/boutique" },
  { icon: MessageSquareQuote, label: "Témoignages", desc: "Approbation avant publication", to: "/administration/temoignages" },
  { icon: CalendarClock, label: "Rendez-vous", desc: "Confirmer, compléter, annuler", to: "/administration/rendez-vous" },
  { icon: CalendarSync, label: "Calendrier", desc: "Synchronisation Google Calendar", to: "/administration/calendrier" },
  { icon: Users, label: "Utilisateurs", desc: "Rôles et accès des comptes", to: "/administration/utilisateurs" },
];

export default function Admin() {
  return (
    <AdminLayout title="Vue d'ensemble" description="Bienvenue dans le panneau d'administration.">
      <div className="grid sm:grid-cols-2 gap-4">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.to}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
          >
            <Link
              to={s.to}
              className="block rounded-2xl bg-beige p-6 hover:bg-panel transition-colors border border-transparent hover:border-sage-deep/30"
            >
              <s.icon size={20} className="text-sage-deep" />
              <p className="mt-4 text-wood-deep leading-snug">{s.label}</p>
              <p className="mt-1.5 text-xs text-stone-light">{s.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
}
