import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STAFF_ROLES = ["super_admin", "admin", "employee", "practitioner"];
const ADMIN_ROLES = ["super_admin", "admin"];

export default function ProtectedRoute({
  children,
  staffOnly = false,
  adminOnly = false,
}: {
  children: ReactNode;
  staffOnly?: boolean;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-stone-light">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (adminOnly && !ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/administration" replace />;
  }

  if (staffOnly && !STAFF_ROLES.includes(user.role)) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  return <>{children}</>;
}
