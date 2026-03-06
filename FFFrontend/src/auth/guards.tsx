import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { UserRole } from "../api/types";
import { useAuth } from "./AuthProvider";
import { Centered } from "../components/Centered";
import { Spinner } from "../components/Spinner";

export function ProtectedRoute() {
  const { token, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Centered><Spinner /></Centered>;
  if (!token) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  return <Outlet />;
}

export function RoleGuard({ allow }: { allow: UserRole[] }) {
  const { me, loading, token } = useAuth();
  if (loading) return <Centered><Spinner /></Centered>;
  if (!token) return <Navigate to="/login" replace />;
  if (!me) return <Centered title="Не удалось загрузить профиль">Попробуйте перезайти.</Centered>;
  if (me.isDisabled) return <Centered title="Аккаунт отключён">Обратитесь к администратору.</Centered>;
  if (!allow.includes(me.role)) return <Centered title="Нет доступа">У вас нет прав для этой страницы.</Centered>;
  return <Outlet />;
}
