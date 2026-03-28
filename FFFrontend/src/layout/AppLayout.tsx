import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/Button";
import "../components/ui.css";

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
};

function roleHome(role: string) {
  if (role === "JOB_SEEKER" || role === "USER") return "/";
  if (role === "COMPANY") return "/company/jobs";
  if (role === "ADMIN") return "/admin/jobs";
  return "/";
}

function useSidebarItems(role: string | undefined, token: string | null): NavItem[] {
  if (!token) {
    return [{ to: "/", label: "Вакансии", end: true }];
  }

  if (role === "COMPANY") {
  return [
    { to: "/", label: "Вакансии", end: true },
    { to: "/company/profile", label: "Профиль компании" },
    { to: "/company/jobs", label: "Мои вакансии" },
    { to: "/company/jobs/new", label: "Создать вакансию" },
    { to: "/company/candidates", label: "Кандидаты" },
    { to: "/inbox", label: "Сообщения" },
    { to: "/notifications", label: "Уведомления" },
  ];
}

  if (role === "ADMIN") {
    return [
      { to: "/", label: "Вакансии", end: true },
      { to: "/admin/jobs", label: "Модерация" },
      { to: "/admin/users", label: "Пользователи" },
      { to: "/admin", label: "Метрики" },
      { to: "/admin/taxonomy", label: "Теги и категории" },
    ];
  }

  return [
    { to: "/", label: "Вакансии", end: true },
    { to: "/seeker/applications", label: "Отклики" },
    { to: "/seeker/saved", label: "Избранное" },
    { to: "/seeker/profile", label: "Профиль" },
    { to: "/seeker/resume", label: "Резюме" },
    { to: "/inbox", label: "Сообщения" },
    { to: "/notifications", label: "Уведомления" },
  ];
}

export function AppLayout() {
  const { me, token, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const items = useSidebarItems(me?.role, token);
  const isJobsHome = location.pathname === "/" || location.pathname.startsWith("/jobs/");

  return (
    <div className="shell">
      <aside className="shell-left">
        <div className="side-card side-card--tall">
          <button
            className="brand-block"
            onClick={() => nav(roleHome(me?.role ?? ""))}
            type="button"
          >
            <span className="brand-mark">J</span>
            <div>
              <div className="brand-title">JobSearch</div>
              <div className="brand-subtitle">career platform</div>
            </div>
          </button>

          <nav className="side-nav" aria-label="sidebar">
            {items.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `side-nav-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="side-bottom">
            {!token ? (
              <>
                <Button onClick={() => nav("/login")}>Войти</Button>
                <Button variant="primary" onClick={() => nav("/register")}>
                  Регистрация
                </Button>
              </>
            ) : (
              <Button onClick={() => logout().then(() => nav("/"))}>
                Выйти
              </Button>
            )}
          </div>
        </div>
      </aside>

      <div className="shell-center">
        <Outlet />
      </div>

      <aside className="shell-right">
        <div className="side-card right-top-card">
          {!token ? (
            <div className="account-box">
              <div className="account-title">Аккаунт</div>
              <div className="account-actions">
                <Button onClick={() => nav("/login")}>Войти</Button>
                <Button variant="primary" onClick={() => nav("/register")}>
                  Регистрация
                </Button>
              </div>
            </div>
          ) : (
            <button
              className="account-chip"
              type="button"
              onClick={() =>
                nav(me?.role === "COMPANY" ? "/company/profile" : roleHome(me?.role ?? ""))
              }
            >
              <span className="account-avatar">
                {(me?.email?.[0] ?? "A").toUpperCase()}
              </span>
              <div className="account-meta">
                <div className="account-name">{me?.email ?? "Аккаунт"}</div>
                <div className="account-role">{me?.role}</div>
              </div>
            </button>
          )}
        </div>

        <div className="side-card right-body-card">
          {isJobsHome ? (
            <div id="jobs-filters-root" />
          ) : (
            <>
              <div className="right-card-title">Правая панель</div>
              <div className="right-card-text">
                Здесь позже можно разместить чаты, техподдержку, быстрые действия
                или вашу рекламу ;)
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}