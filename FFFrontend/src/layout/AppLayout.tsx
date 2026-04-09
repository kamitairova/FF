import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

type NavItem = {
  to: string;
  label: string;
};

function getRoleLabel(role?: string) {
  if (role === "USER") return "Соискатель";
  if (role === "COMPANY") return "Работодатель";
  if (role === "ADMIN") return "Администратор";
  return "Гость";
}

function buildNav(role?: string): NavItem[] {
  const common: NavItem[] = [
    { to: "/", label: "Вакансии" },
    { to: "/resumes", label: "Резюме" },
  ];

  if (role === "COMPANY") {
    return [
      ...common,
      { to: "/company/jobs", label: "Мои вакансии" },
      { to: "/company/jobs/new", label: "Создать вакансию" },
      { to: "/company/profile", label: "Профиль компании" },
      { to: "/company/candidates", label: "Кандидаты" },
      { to: "/inbox", label: "Сообщения" },
      { to: "/notifications", label: "Уведомления" },
    ];
  }

  if (role === "USER") {
    return [
      ...common,
      { to: "/seeker/profile", label: "Профиль" },
      { to: "/seeker/resumes", label: "Мои резюме" },
      { to: "/seeker/applications", label: "Отклики" },
      { to: "/seeker/saved", label: "Сохранённые вакансии" },
      { to: "/inbox", label: "Сообщения" },
      { to: "/notifications", label: "Уведомления" },
    ];
  }

  if (role === "ADMIN") {
    return [
      ...common,
      { to: "/admin", label: "Дашборд" },
      { to: "/admin/jobs", label: "Модерация вакансий" },
      { to: "/admin/users", label: "Пользователи" },
      { to: "/admin/taxonomy", label: "Категории и теги" },
      { to: "/notifications", label: "Уведомления" },
    ];
  }

  return [
    ...common,
    { to: "/login", label: "Войти" },
    { to: "/register", label: "Регистрация" },
  ];
}

function RightSidebar() {
  const { me, logout } = useAuth();
  const location = useLocation();

  const isMainListing =
    location.pathname === "/" || location.pathname === "/resumes";

  const title = me ? me.email : "Гость";
  const subtitle = getRoleLabel(me?.role);
  const avatarLetter = me?.email?.[0]?.toUpperCase() ?? "S";

  return (
    <aside className="shell-right">
      <div className="side-card side-card--tall">
        <div className="side-card right-top-card">
          <div className="account-chip">
            <div className="account-avatar">{avatarLetter}</div>

            <div className="account-meta">
              <div className="account-name">{title}</div>
              <div className="account-role">{subtitle}</div>
            </div>
          </div>
        </div>

        <div className="side-card right-body-card">
          {isMainListing ? (
            <div id="page-filters-root" />
          ) : (
            <div className="right-card-text">
              Правая панель пока пустая, но место под неё закреплено.
            </div>
          )}
        </div>

        {me && (
          <div className="side-bottom">
            <button className="btn btn-secondary" onClick={() => void logout()}>
              Выйти
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function AppLayout() {
  const { me } = useAuth();
  const navItems = buildNav(me?.role);

  return (
    <div className="shell">
      <aside className="shell-left">
        <div className="side-card side-card--tall">
          <Link to="/" className="brand-block">
            <div className="brand-mark">J</div>
            <div>
              <div className="brand-title">JobSearch</div>
              <div className="brand-subtitle">career platform</div>
            </div>
          </Link>

          <nav className="side-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `side-nav-link${isActive ? " active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <main className="shell-center">
        <Outlet />
      </main>

      <RightSidebar />
    </div>
  );
}