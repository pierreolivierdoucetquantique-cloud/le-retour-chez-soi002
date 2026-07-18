import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  CalendarClock,
  Boxes,
  Newspaper,
  ShoppingBag,
  MessageSquareQuote,
  LayoutGrid,
  CalendarSync,
} from "lucide-react";
import Layout from "./Layout";

const NAV_ITEMS = [
  { to: "/administration", label: "Vue d'ensemble", icon: LayoutGrid, end: true },
  { to: "/administration/services", label: "Services", icon: Boxes },
  { to: "/administration/blog", label: "Blog", icon: Newspaper },
  { to: "/administration/evenements", label: "Événements", icon: CalendarClock },
  { to: "/administration/boutique", label: "Boutique", icon: ShoppingBag },
  { to: "/administration/temoignages", label: "Témoignages", icon: MessageSquareQuote },
  { to: "/administration/rendez-vous", label: "Rendez-vous", icon: CalendarClock },
  { to: "/administration/calendrier", label: "Calendrier", icon: CalendarSync },
  { to: "/administration/utilisateurs", label: "Utilisateurs", icon: Users },
];

export default function AdminLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Layout>
      <section className="pt-32 pb-24 min-h-[80vh]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <span className="label-eyebrow text-sage-deep">Administration</span>
          <h1 className="mt-3 text-3xl md:text-4xl mb-2">{title}</h1>
          {description && <p className="text-stone max-w-xl mb-10">{description}</p>}
          {!description && <div className="mb-10" />}

          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-label whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-sage-deep text-warmwhite"
                        : "text-stone hover:bg-beige"
                    }`
                  }
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
