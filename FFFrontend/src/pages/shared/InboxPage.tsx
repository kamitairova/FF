import React from "react";
import { useQuery } from "@tanstack/react-query";
import { messagingApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import type { MessagingThread } from "../../api/types";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Link } from "react-router-dom";
import "../../components/ui.css";

function getThreadTitle(thread: MessagingThread, role?: string) {
  if (role === "COMPANY") {
    const first = thread.seekerProfile?.firstName ?? "";
    const last = thread.seekerProfile?.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || "Соискатель";
  }

  return thread.companyProfile?.companyName?.trim() || "Компания";
}

export function InboxPage() {
  const { token, me } = useAuth();

  const q = useQuery<MessagingThread[]>({
    queryKey: ["threads"],
    queryFn: () => messagingApi.threads(token!),
    enabled: !!token,
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;

  if (q.isError) {
    return (
      <Centered title="Ошибка">
        {(q.error as any)?.message ?? "Не удалось загрузить сообщения."}
      </Centered>
    );
  }

  const items = q.data ?? [];

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Сообщения</h1>
        <p className="p" style={{ marginTop: 6 }}>
          Здесь показаны все ваши диалоги.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пока нет диалогов</h2>
          <p className="p" style={{ marginTop: 6 }}>
            Когда вы откликнетесь на вакансию или получите приглашение, чат появится здесь.
          </p>
        </div>
      ) : (
        <div className="grid">
          {items.map((thread) => (
            <Link key={thread.id} to={`/inbox/${thread.id}`} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {getThreadTitle(thread, me?.role)}
                  </div>

                  {thread.vacancy?.title && (
                    <div className="small" style={{ marginTop: 6 }}>
                      Вакансия: {thread.vacancy.title}
                    </div>
                  )}

                  {thread.messages?.[0] && (
                    <div className="small" style={{ marginTop: 8 }}>
                      {thread.messages[0].body}
                    </div>
                  )}
                </div>

                <div className="badge badge-blue">Открыть</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}