import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api, ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  employee: "Employé",
  practitioner: "Praticien·ne",
  client: "Client·e",
  guest: "Invité·e",
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    api
      .get<{ users: AdminUser[] }>("/users")
      .then((res) => setUsers(res.users))
      .catch(() => setError("Impossible de charger les utilisateurs."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const changeRole = async (id: string, role: string) => {
    setBusyId(id);
    setError(null);
    try {
      await api.patch(`/users/${id}/role`, { role });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de changer ce rôle.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = async (u: AdminUser) => {
    setBusyId(u.id);
    setError(null);
    try {
      await api.patch(`/users/${u.id}/status`, { isActive: !u.isActive });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de mettre à jour ce compte.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Utilisateurs" description="Gérer les rôles et l'accès des comptes.">
      {error && <p className="mb-4 text-sm text-wood-deep">{error}</p>}
      {isLoading ? (
        <p className="text-stone-light">Chargement...</p>
      ) : (
        <div className="rounded-2xl border border-warmwhite/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-stone-light font-label text-xs uppercase tracking-[0.06em]">
              <tr>
                <th className="text-left px-5 py-3">Nom</th>
                <th className="text-left px-5 py-3">Courriel</th>
                <th className="text-left px-5 py-3">Rôle</th>
                <th className="text-left px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmwhite/10">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 text-wood-deep">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-5 py-3 text-stone">{u.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      disabled={busyId === u.id || u.id === me?.id}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="rounded-lg bg-panel border border-warmwhite/10 text-warmwhite text-xs px-3 py-1.5 focus:outline-none focus:border-sage-deep disabled:opacity-50"
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleStatus(u)}
                      disabled={busyId === u.id || u.id === me?.id}
                      className={`text-xs font-label px-2.5 py-1 rounded-full disabled:opacity-50 ${
                        u.isActive ? "bg-sage-deep/15 text-sage-deep" : "bg-wood/15 text-wood"
                      }`}
                    >
                      {u.isActive ? "Actif" : "Désactivé"}
                    </button>
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
