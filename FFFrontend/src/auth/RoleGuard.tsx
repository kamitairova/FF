import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "../api/types";

type RoleGuardProps = {
  allow: UserRole[];
  children: ReactNode;
};

export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const { me, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-slate-600">
        Загрузка...
      </div>
    );
  }

  if (!me) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allow.includes(me.role)) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Нет доступа</h1>
        <p className="mt-2 text-sm text-slate-500">
          У вас нет прав для просмотра этой страницы.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}