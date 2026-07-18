import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { api, ApiError } from "../lib/api";
import type { ApiAppointment } from "../lib/types";
import { formatDateLong, formatTime } from "../lib/format";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice] = useState<string | null>(
    searchParams.get("rendezvous") === "confirme"
      ? "Paiement reçu — votre rendez-vous est confirmé."
      : searchParams.get("rendezvous") === "annule"
        ? "Le paiement a été annulé. Votre rendez-vous reste en attente ; vous pouvez réessayer."
        : null
  );

  const load = () => {
    api
      .get<{ appointments: ApiAppointment[] }>("/appointments")
      .then((res) => setAppointments(res.appointments))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const upcoming = appointments
    .filter((a) => a.status !== "cancelled" && new Date(a.startsAt) > new Date())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const completedCount = appointments.filter((a) => a.status === "completed").length;

  const cancel = async (id: string) => {
    setCancellingId(id);
    setError(null);
    try {
      await api.patch(`/appointments/${id}/status`, { status: "cancelled" });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'annuler ce rendez-vous.");
    } finally {
      setCancellingId(null);
    }
  };

  const pay = async (id: string, payInFull: boolean) => {
    setPayingId(id);
    setError(null);
    try {
      const res = await api.post<{ payment: { redirectUrl: string | null; instructions: string } }>(
        `/appointments/${id}/checkout`,
        { payInFull }
      );
      if (res.payment.redirectUrl) {
        window.location.href = res.payment.redirectUrl;
        return;
      }
      setError(res.payment.instructions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de démarrer le paiement.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <DashboardLayout>
      {notice && (
        <p className="mb-6 rounded-xl bg-sage-deep/10 text-sage-deep text-sm px-4 py-3">
          {notice}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid sm:grid-cols-3 gap-4 mb-10"
      >
        <div className="rounded-2xl bg-beige p-6">
          <p className="text-3xl font-display text-wood-deep">{upcoming.length}</p>
          <p className="mt-1 text-sm text-stone">Rendez-vous à venir</p>
        </div>
        <div className="rounded-2xl bg-beige p-6">
          <p className="text-3xl font-display text-wood-deep">{completedCount}</p>
          <p className="mt-1 text-sm text-stone">Séances complétées</p>
        </div>
        <div className="rounded-2xl bg-beige p-6">
          <p className="text-3xl font-display text-wood-deep">{appointments.length}</p>
          <p className="mt-1 text-sm text-stone">Rendez-vous au total</p>
        </div>
      </motion.div>

      <h2 className="text-xl text-wood-deep mb-4">Prochains rendez-vous</h2>

      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}
      {isLoading && <p className="text-stone-light">Chargement...</p>}
      {!isLoading && upcoming.length === 0 && (
        <p className="text-stone-light">
          Aucun rendez-vous à venir.{" "}
          <a href="/services" className="text-sage-deep underline">
            Réserver une séance
          </a>
          .
        </p>
      )}

      {upcoming.length > 0 && (
        <div className="divide-y divide-stone/10 rounded-2xl border border-stone/10 overflow-hidden">
          {upcoming.map((a) => (
            <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
              <div>
                <p className="text-wood-deep">
                  {formatDateLong(a.startsAt)} — {formatTime(a.startsAt)}
                </p>
                <p className="text-sm text-stone-light mt-0.5 capitalize">
                  Statut : {a.status === "pending" ? "en attente" : a.status}
                  {a.isPaid && <span className="text-sage-deep"> · Payé</span>}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {!a.isPaid && (
                  <>
                    <button
                      onClick={() => pay(a.id, false)}
                      disabled={payingId === a.id}
                      className="text-sm font-label text-sage-deep hover:underline disabled:opacity-50"
                    >
                      {payingId === a.id ? "..." : "Payer un dépôt"}
                    </button>
                    <button
                      onClick={() => pay(a.id, true)}
                      disabled={payingId === a.id}
                      className="text-sm font-label rounded-full bg-sage-deep text-warmwhite px-4 py-2 hover:bg-wood transition-colors disabled:opacity-50"
                    >
                      Payer en totalité
                    </button>
                  </>
                )}
                <button
                  onClick={() => cancel(a.id)}
                  disabled={cancellingId === a.id}
                  className="text-sm font-label text-stone hover:text-wood disabled:opacity-50"
                >
                  {cancellingId === a.id ? "..." : "Annuler"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
