import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api, ApiError } from "../../lib/api";
import type { ApiAppointment } from "../../lib/types";
import { formatDateLong, formatTime } from "../../lib/format";

const STATUS_LABELS: Record<ApiAppointment["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Complété",
};

const STATUS_STYLES: Record<ApiAppointment["status"], string> = {
  pending: "bg-gold/15 text-gold",
  confirmed: "bg-sage-deep/15 text-sage-deep",
  cancelled: "bg-wood/15 text-wood",
  completed: "bg-warmwhite/15 text-warmwhite",
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    api
      .get<{ appointments: ApiAppointment[] }>("/appointments")
      .then((res) =>
        setAppointments(
          res.appointments.sort((a, b) => b.startsAt.localeCompare(a.startsAt))
        )
      )
      .catch(() => setError("Impossible de charger les rendez-vous."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: ApiAppointment["status"]) => {
    setUpdatingId(id);
    setError(null);
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de mettre à jour ce rendez-vous.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="Rendez-vous" description="Vue d'ensemble de toutes les réservations.">
      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}
      {isLoading ? (
        <p className="text-stone-light">Chargement...</p>
      ) : appointments.length === 0 ? (
        <p className="text-stone-light">Aucun rendez-vous pour le moment.</p>
      ) : (
        <div className="rounded-2xl border border-warmwhite/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-stone-light font-label text-xs uppercase tracking-[0.06em]">
              <tr>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Statut</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmwhite/10">
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 text-wood-deep">
                    {formatDateLong(a.startsAt)} — {formatTime(a.startsAt)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-label px-2.5 py-1 rounded-full ${STATUS_STYLES[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <select
                        value={a.status}
                        disabled={updatingId === a.id}
                        onChange={(e) => updateStatus(a.id, e.target.value as ApiAppointment["status"])}
                        className="rounded-lg bg-panel border border-warmwhite/10 text-warmwhite text-xs px-3 py-1.5 focus:outline-none focus:border-sage-deep"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="completed">Complété</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
