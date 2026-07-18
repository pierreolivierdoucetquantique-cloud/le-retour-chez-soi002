import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarCheck, CalendarX } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { api, ApiError } from "../../lib/api";

interface Status {
  configured: boolean;
  connected: boolean;
  email: string | null;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export default function AdminCalendar() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("calendrier") === "connecte"
      ? "Google Calendar connecté avec succès."
      : searchParams.get("calendrier") === "erreur"
        ? "La connexion a échoué. Réessayez, ou vérifiez la configuration côté serveur."
        : null
  );
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get<Status>("/calendar/google/status")
      .then(setStatus)
      .catch(() => setError("Impossible de vérifier le statut de la connexion."));
  };

  useEffect(load, []);

  const disconnect = async () => {
    if (!confirm("Déconnecter Google Calendar ? Les nouveaux rendez-vous ne seront plus synchronisés.")) {
      return;
    }
    setBusy(true);
    try {
      await api.delete("/calendar/google");
      setNotice("Google Calendar déconnecté.");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de déconnecter.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      title="Calendrier"
      description="Synchroniser les rendez-vous confirmés avec Google Calendar."
    >
      {notice && (
        <p className="mb-4 rounded-xl bg-sage-deep/10 text-sage-deep text-sm px-4 py-3">{notice}</p>
      )}
      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}

      {!status ? (
        <p className="text-stone-light">Chargement...</p>
      ) : !status.configured ? (
        <div className="glass bg-panel border border-warmwhite/10 rounded-2xl p-6">
          <p className="text-wood-deep">Non configuré sur ce serveur</p>
          <p className="mt-2 text-sm text-stone">
            Les variables <code className="text-gold">GOOGLE_CLIENT_ID</code>,{" "}
            <code className="text-gold">GOOGLE_CLIENT_SECRET</code> et{" "}
            <code className="text-gold">GOOGLE_REDIRECT_URI</code> ne sont pas définies dans
            l'environnement du serveur. Voir <code className="text-gold">backend/README.md</code>{" "}
            pour la marche à suivre complète (création du projet Google Cloud, écran de
            consentement OAuth, identifiants).
          </p>
        </div>
      ) : status.connected ? (
        <div className="glass bg-panel border border-warmwhite/10 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CalendarCheck size={22} className="text-sage-deep" />
            <div>
              <p className="text-wood-deep">Connecté</p>
              <p className="text-sm text-stone-light">{status.email}</p>
            </div>
          </div>
          <button
            onClick={disconnect}
            disabled={busy}
            className="rounded-full border border-wood/40 text-wood px-5 py-2.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood/10 transition-colors disabled:opacity-50"
          >
            Déconnecter
          </button>
        </div>
      ) : (
        <div className="glass bg-panel border border-warmwhite/10 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CalendarX size={22} className="text-stone-light" />
            <p className="text-stone">Aucun calendrier connecté pour le moment.</p>
          </div>
          <a
            href={`${API_URL}/calendar/google/connect`}
            className="rounded-full bg-sage-deep text-warmwhite px-5 py-2.5 font-label text-sm uppercase tracking-[0.1em] hover:bg-wood transition-colors"
          >
            Connecter Google Calendar
          </a>
        </div>
      )}

      <p className="mt-6 text-sm text-stone-light max-w-xl">
        Une fois connecté, chaque nouvelle réservation crée automatiquement un événement dans ce
        calendrier, et son annulation le supprime. Un problème de synchronisation n'empêche jamais
        la réservation elle-même — elle reste enregistrée normalement.
      </p>
    </AdminLayout>
  );
}
