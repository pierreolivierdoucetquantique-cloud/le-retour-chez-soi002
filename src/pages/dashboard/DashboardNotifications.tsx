import { useEffect, useState } from "react";
import { CalendarCheck, CalendarX, Receipt, Clock } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { api } from "../../lib/api";
import type { ApiAppointment, ApiInvoice } from "../../lib/types";
import { formatDateLong, formatTime } from "../../lib/format";

interface Notification {
  id: string;
  icon: typeof CalendarCheck;
  text: string;
  date: string;
}

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ appointments: ApiAppointment[] }>("/appointments"),
      api.get<{ invoices: ApiInvoice[] }>("/invoices"),
    ])
      .then(([{ appointments }, { invoices }]) => {
        const items: Notification[] = [];

        for (const a of appointments) {
          if (a.status === "cancelled") {
            items.push({
              id: `apt-cancelled-${a.id}`,
              icon: CalendarX,
              text: `Rendez-vous du ${formatDateLong(a.startsAt)} à ${formatTime(a.startsAt)} annulé.`,
              date: a.startsAt,
            });
          } else if (new Date(a.startsAt) > new Date()) {
            items.push({
              id: `apt-upcoming-${a.id}`,
              icon: Clock,
              text: `Rendez-vous à venir le ${formatDateLong(a.startsAt)} à ${formatTime(a.startsAt)}.`,
              date: a.startsAt,
            });
          } else if (a.status === "completed") {
            items.push({
              id: `apt-completed-${a.id}`,
              icon: CalendarCheck,
              text: `Séance du ${formatDateLong(a.startsAt)} complétée.`,
              date: a.startsAt,
            });
          }
        }

        for (const inv of invoices) {
          if (inv.status === "paid") {
            items.push({
              id: `inv-paid-${inv.id}`,
              icon: Receipt,
              text: `Facture ${inv.number} payée — ${inv.description}.`,
              date: inv.createdAt,
            });
          }
        }

        items.sort((a, b) => b.date.localeCompare(a.date));
        setNotifications(items);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-xl text-wood-deep mb-4">Notifications</h2>

      {isLoading && <p className="text-stone-light">Chargement...</p>}

      {!isLoading && notifications.length === 0 && (
        <p className="text-stone-light">Aucune notification pour le moment.</p>
      )}

      {notifications.length > 0 && (
        <div className="divide-y divide-stone/10 rounded-2xl border border-stone/10 overflow-hidden">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-5">
              <n.icon size={17} className="text-sage-deep mt-0.5 shrink-0" />
              <div>
                <p className="text-wood-deep text-sm">{n.text}</p>
                <p className="text-xs text-stone-light mt-0.5">{formatDateLong(n.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
