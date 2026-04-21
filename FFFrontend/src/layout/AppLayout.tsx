import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import ChatSidebar from "../components/ChatSidebar";

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
      { to: "/company/profile", label: "Профиль" },
      { to: "/company/jobs", label: "Мои вакансии" },
      { to: "/company/jobs/new", label: "Создать вакансию" },
      { to: "/company/candidates", label: "Кандидаты" },
      { to: "/inbox", label: "Сообщения" },
    ];
  }

  if (role === "USER") {
    return [
      ...common,
      { to: "/seeker/profile", label: "Профиль" },
      { to: "/seeker/resumes", label: "Мои резюме" },
      { to: "/seeker/resumes/new", label: "Создать резюме" },
      { to: "/seeker/applications", label: "Отклики" },
      { to: "/seeker/saved", label: "Сохранённые вакансии" },
      { to: "/inbox", label: "Сообщения" },
    ];
  }

  if (role === "ADMIN") {
    return [
      ...common,
      { to: "/admin", label: "Дашборд" },
      { to: "/admin/jobs", label: "Модерация вакансий" },
      { to: "/admin/resumes", label: "Модерация резюме" },
      { to: "/admin/users", label: "Пользователи" },
      { to: "/admin/taxonomy", label: "Категории и теги" },
    ];
  }

  return common;
}

function RightSidebar() {
  const { me } = useAuth();
  const location = useLocation();

  const isMainListing =
    location.pathname === "/" || location.pathname === "/resumes";

  const profileLink =
    me?.role === "COMPANY"
      ? "/company/profile"
      : me?.role === "USER"
      ? "/seeker/profile"
      : me?.role === "ADMIN"
      ? "/admin"
      : "/login";

  const title = me?.displayName || (me ? me.email : "Гость");
  const subtitle = getRoleLabel(me?.role);
  const avatarLetter = title?.[0]?.toUpperCase() ?? "Г";

  return (
    <aside className="shell-right">
      <div className="side-card side-card--tall">
        <div className="side-card right-top-card">
          <Link
            to={profileLink}
            className="account-chip"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {me?.avatarUrl ? (
              <div className="account-avatar" style={{ overflow: "hidden" }}>
                <img
                  src={me.avatarUrl}
                  alt={title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ) : (
              <div className="account-avatar">{avatarLetter}</div>
            )}

            <div className="account-meta">
              <div className="account-name">{title}</div>
              <div className="account-role">{subtitle}</div>
            </div>
          </Link>
        </div>

        <div className="side-card right-body-card">
          {isMainListing ? <div id="page-filters-root" /> : <ChatSidebar />}
        </div>
      </div>
    </aside>
  );
}

export default function AppLayout() {
  const { me, logout } = useAuth();
  const navItems = buildNav(me?.role);

  return (
    <div className="shell">
      <aside className="shell-left">
        <div
          className="side-card side-card--tall"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Link to="/" className="brand-block" style={{ textDecoration: "none" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: 1,
                textTransform: "lowercase",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
              }}
            >
              ff
            </div>

            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                Fast Find
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 2,
                }}
              >
                career platform
              </div>
            </div>
          </Link>

          {/* НАВИГАЦИЯ — НЕ ТРОГАЕМ */}
          <nav
            className="side-nav"
            style={{
              flex: 1,
            }}
          >
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

          {/* НИЖНИЙ БЛОК */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid rgba(148, 163, 184, 0.25)",
              display: "grid",
              gap: 8,
            }}
          >
            {!me ? (
              <>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      background: "#f1f5f9",
                      textAlign: "center",
                      fontWeight: 600,
                      transition: "0.2s",
                    }}
                  >
                    Войти
                  </div>
                </Link>

                <Link to="/register" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      background: "#e0f2fe",
                      textAlign: "center",
                      fontWeight: 600,
                      transition: "0.2s",
                    }}
                  >
                    Регистрация
                  </div>
                </Link>
              </>
            ) : (
              <button
                onClick={() => void logout()}
                style={{
                  padding: "10px",
                  borderRadius: 10,
                  background: "#fee2e2",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                Выйти
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="shell-center">
        <Outlet />
      </main>

      <RightSidebar />
    </div>
  );
}