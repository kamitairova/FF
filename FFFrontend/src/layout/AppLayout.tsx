import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/Button";
import "../components/ui.css";

function roleHome(role: string) {
  if (role === "JOB_SEEKER") return "/seeker/applications";
  if (role === "COMPANY") return "/company/jobs";
  if (role === "ADMIN") return "/admin";
  return "/";
}

export function AppLayout() {
  const { me, token, logout } = useAuth();
  const nav = useNavigate();

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <a className="brand" href="/" onClick={(e) => { e.preventDefault(); nav("/"); }}>
            <span className="brand-badge" />
            JobSearch
          </a>

          <nav className="nav" aria-label="navigation">
            <NavLink to="/" end>Вакансии</NavLink>
            {token && me?.role === "JOB_SEEKER" && (
              <>
                <NavLink to="/seeker/applications">Отклики</NavLink>
                <NavLink to="/seeker/saved">Избранное</NavLink>
                <NavLink to="/seeker/profile">Профиль</NavLink>
                <NavLink to="/seeker/resume">Резюме</NavLink>
                <NavLink to="/inbox">Сообщения</NavLink>
                <NavLink to="/notifications">Уведомления</NavLink>
              </>
            )}
            {token && me?.role === "COMPANY" && (
              <>
                <NavLink to="/company/jobs">Мои вакансии</NavLink>
                <NavLink to="/company/candidates">Кандидаты</NavLink>
                <NavLink to="/inbox">Сообщения</NavLink>
                <NavLink to="/notifications">Уведомления</NavLink>
              </>
            )}
            {token && me?.role === "ADMIN" && (
              <>
                <NavLink to="/admin">Админ</NavLink>
                <NavLink to="/admin/jobs">Модерация</NavLink>
                <NavLink to="/admin/users">Пользователи</NavLink>
                <NavLink to="/admin/taxonomy">Категории/Теги</NavLink>
              </>
            )}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!token ? (
              <>
                <Button onClick={() => nav("/login")}>Войти</Button>
                <Button variant="primary" onClick={() => nav("/register")}>Регистрация</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => nav(roleHome(me?.role ?? ""))}>
                  <span style={{ fontWeight: 800 }}>{me?.email ?? "Аккаунт"}</span>
                </Button>
                <Button onClick={() => logout().then(() => nav("/"))}>Выйти</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "18px 16px 44px" }}>
        <Outlet />
      </main>

      <footer className="container" style={{ padding: "22px 16px", color: "var(--muted)" }}>
        <div className="hr" style={{ marginBottom: 14 }} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>JobSearch MVP — UI в стиле hh/LinkedIn.</span>
          <span>API base: <b style={{ color: "var(--text)" }}>{(import.meta as any).env?.VITE_API_BASE_URL || "/api"}</b></span>
        </div>
      </footer>
    </>
  );
}
