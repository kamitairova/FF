import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { messagingApi } from "../api/endpoints";
import type { MessagingThread } from "../api/types";
import { useAuth } from "../auth/AuthProvider";

function formatTime(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function getAvatarLetter(name?: string | null) {
  return name?.trim()?.[0]?.toUpperCase() || "?";
}

function getThreadName(thread: MessagingThread, role?: string) {
  if (role === "COMPANY") {
    const first = thread.seekerProfile?.firstName ?? "";
    const last = thread.seekerProfile?.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || "Соискатель";
  }

  return thread.companyProfile?.companyName?.trim() || "Компания";
}

function getThreadSubtitle(thread: MessagingThread, role?: string) {
  if (role === "COMPANY") {
    return (
      thread.vacancy?.title ||
      thread.seekerProfile?.headline ||
      thread.seekerProfile?.location ||
      "Диалог с кандидатом"
    );
  }

  const city = thread.companyProfile?.companyCity?.trim();
  const country = thread.companyProfile?.companyCountry?.trim();
  const place = [city, country].filter(Boolean).join(", ");

  return place || thread.vacancy?.title || "Диалог с компанией";
}

export default function ChatSidebar() {
  const { token, me } = useAuth();
  const location = useLocation();

  const q = useQuery<MessagingThread[]>({
    queryKey: ["chat-sidebar", "all"],
    queryFn: () => messagingApi.threads(token!),
    enabled: !!token && !!me && me.role !== "ADMIN",
    refetchInterval: 10000,
  });

  if (!token || !me || me.role === "ADMIN") {
    return <div className="right-card-text">Войдите в аккаунт, чтобы видеть чаты.</div>;
  }

  if (q.isLoading) {
    return <div className="right-card-text">Загрузка чатов…</div>;
  }

  if (q.isError) {
    return <div className="right-card-text">Не удалось загрузить чаты.</div>;
  }

  const items = q.data ?? [];

  if (!items.length) {
    return <div className="right-card-text">Пока нет открытых чатов.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((thread) => {
        const active = location.pathname === `/inbox/${thread.id}`;
        const name = getThreadName(thread, me.role);
        const subtitle = getThreadSubtitle(thread, me.role);
        const preview = thread.messages?.[0]?.body || "Сообщений пока нет";
        const time = thread.messages?.[0]?.createdAt || thread.updatedAt;
        const avatarLetter = getAvatarLetter(name);

        return (
          <Link
            key={thread.id}
            to={`/inbox/${thread.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              border: active ? "1px solid #93c5fd" : "1px solid #e2e8f0",
              background: active ? "#eff6ff" : "#fff",
              borderRadius: 14,
              padding: 10,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  overflow: "hidden",
                  background: "#e2e8f0",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}
              >
                {thread.companyProfile?.companyLogoUrl && me.role !== "COMPANY" ? (
                  <img
                    src={thread.companyProfile.companyLogoUrl}
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span>{avatarLetter}</span>
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {name}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {subtitle}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#334155",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {preview}
            </div>

            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>
              {formatTime(time)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}