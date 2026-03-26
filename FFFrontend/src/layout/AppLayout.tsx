import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../components/ui.css";

function roleHome(role: string) {
  if (role === "JOB_SEEKER") return "/";
  if (role === "COMPANY") return "/company/jobs";
  if (role === "ADMIN") return "/admin";
  return "/";
}

function icon(label: string) {
  const icons: Record<string, string> = {
    jobs: "⌕",
    applications: "▣",
    saved: "♡",
    profile: "◌",
    resume: "✎",
    messages: "✉",
    notifications: "⎋",
    company: "▤",
    candidates: "◫",
    admin: "⚙",
    taxonomy: "#",
  };
  return icons[label] ?? "•";
}

export function AppLayout() {
  const { me, token, logout } = useAuth();
  const nav = useNavigate();

  const commonLinks = [{ to: "/", label: "Вакансии", key: "jobs" }];
  const seekerLinks = [
    { to: "/seeker/applications", label: "Отклики", key: "applications" },
    { to: "/seeker/saved", label: "Избранное", key: "saved" },
    { to: "/seeker/profile", label: "Профиль", key: "profile" },
    { to: "/seeker/resume", label: "Резюме", key: "resume" },
    { to: "/messages", label: "Сообщения", key: "messages" },
    { to: "/notifications", label: "Уведомления", key: "notifications" },
  ];
  const companyLinks = [
    { to: "/company/jobs", label: "Мои вакансии", key: "company" },
    { to: "/company/candidates", label: "Кандидаты", key: "candidates" },
    { to: "/messages", label: "Сообщения", key: "messages" },
    { to: "/notifications", label: "Уведомления", key: "notifications" },
  ];
  const adminLinks = [
    { to: "/admin", label: "Админ", key: "admin" },
    { to: "/admin/jobs", label: "Модерация", key: "company" },
    { to: "/admin/users", label: "Пользователи", key: "profile" },
    { to: "/admin/taxonomy", label: "Категории", key: "taxonomy" },
  ];

  const links = [
    ...commonLinks,
    ...(token && me?.role === "JOB_SEEKER" ? seekerLinks : []),
    ...(token && me?.role === "COMPANY" ? companyLinks : []),
    ...(token && me?.role === "ADMIN" ? adminLinks : []),
    ...(!token
      ? [
          { to: "/login", label: "Войти", key: "profile" },
          { to: "/register", label: "Регистрация", key: "resume" },
        ]
      : []),
  ];

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-frame">
          <aside className="app-sidebar">
            <div className="sidebar-top">
              <div className="sidebar-logo">
                <div className="sidebar-logo-mark">ff</div>
                <div className="sidebar-logo-text">
                  <strong>Fast Find</strong>
                  <span>job platform</span>
                </div>
              </div>

              <nav className="sidebar-nav">
                {links.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `sidebar-link${isActive ? " active" : ""}`
                    }
                  >
                    <span className="sidebar-icon">{icon(item.key)}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="sidebar-bottom">
              <div className="sidebar-user">
                <div className="sidebar-user-title">Аккаунт</div>
                <div className="sidebar-user-email">{me?.email ?? "Гость"}</div>
                <div className="small" style={{ marginTop: 6 }}>
                  {token ? `Роль: ${me?.role ?? "USER"}` : "Войдите, чтобы откликаться и сохранять вакансии."}
                </div>
              </div>

              {token ? (
                <button
                  className="btn sidebar-logout"
                  onClick={() => logout().then(() => nav("/"))}
                >
                  Выйти
                </button>
              ) : (
                <button className="btn btn-primary sidebar-logout" onClick={() => nav("/login")}>
                  Начать
                </button>
              )}
            </div>
          </aside>

          <main className="page-main">
            <Outlet />
            <div className="footer-note">
              Fast Find — светлый дашборд с навигацией слева, контентом по центру и рабочими панелями справа.
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
