import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/Button";
import "../components/ui.css";

function roleHome(role: string) {
  if (role === "JOB_SEEKER") return "/seeker/profile";
  if (role === "COMPANY") return "/company/jobs";
  if (role === "ADMIN") return "/admin";
  return "/";
}

export function AppLayout() {
  const { me, token, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="page-shell">
      <header className="header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            <span className="brand-badge">ff</span>
            <span className="brand-copy">
              <span>Fast Find</span>
              <small>jobs • candidates • chat</small>
            </span>
          </NavLink>

          <nav className="nav">
            <NavLink to="/">Вакансии</NavLink>
            {token && me?.role === "JOB_SEEKER" && (
              <>
                <NavLink to="/seeker/profile">Профиль</NavLink>
                <NavLink to="/seeker/applications">Отклики</NavLink>
                <NavLink to="/seeker/saved">Избранное</NavLink>
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

          <div className="header-actions">
            {!token ? (
              <>
                <Button onClick={() => nav("/login")}>Войти</Button>
                <Button variant="primary" onClick={() => nav("/register")}>Регистрация</Button>
              </>
            ) : (
              <>
                <Button onClick={() => nav(roleHome(me?.role ?? ""))}>{me?.email ?? "Аккаунт"}</Button>
                <Button variant="ghost" onClick={() => logout().then(() => nav("/"))}>Выйти</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="page-main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="brand" style={{ marginBottom: 8 }}>
              <span className="brand-badge">ff</span>
              <span className="brand-copy">
                <span>Fast Find</span>
                <small>Быстрый и аккуратный поиск работы</small>
              </span>
            </div>
            <div className="small">Улучшенный frontend без изменений backend API.</div>
          </div>
          <div className="footer-links">
            <NavLink to="/">Вакансии</NavLink>
            <NavLink to="/login">Войти</NavLink>
            <NavLink to="/register">Регистрация</NavLink>
            <NavLink to="/notifications">Уведомления</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
