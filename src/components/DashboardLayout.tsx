import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  FileText,
  Download,
  MessageSquare,
  Bell,
  User,
} from "lucide-react";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/tableau-de-bord", label: "Rendez-vous", icon: Calendar, end: true },
  { to: "/tableau-de-bord/factures", label: "Factures", icon: FileText },
  { to: "/tableau-de-bord/telechargements", label: "Téléchargements", icon: Download },
  { to: "/tableau-de-bord/messages", label: "Messages", icon: MessageSquare },
  { to: "/tableau-de-bord/notifications", label: "Notifications", icon: Bell },
  { to: "/tableau-de-bord/profil", label: "Profil", icon: User },
];

export default function DashboardLayout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="pt-32 pb-24 min-h-[80vh]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <span className="label-eyebrow text-sage-deep">Mon espace</span>
          <h1 className="mt-3 text-3xl md:text-4xl mb-10">
            {title ?? `Bonjour ${user?.firstName ?? ""}`}
          </h1>

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
