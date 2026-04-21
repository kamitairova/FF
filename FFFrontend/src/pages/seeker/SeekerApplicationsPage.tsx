import React from "react";
import { useQuery } from "@tanstack/react-query";
import { messagingApi } from "../../api/endpoints";
import type { MessagingThread } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Link } from "react-router-dom";
import "../../components/ui.css";

function getCompanyTitle(thread: MessagingThread) {
  return thread.companyProfile?.companyName?.trim() || "Компания";
}

function getCompanySubtitle(thread: MessagingThread) {
  const city = thread.companyProfile?.companyCity?.trim();
  const country = thread.companyProfile?.companyCountry?.trim();

  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return "Диалог по вакансии";
}

export function SeekerApplicationsPage() {
  const { token } = useAuth();

  const q = useQuery<MessagingThread[]>({
    queryKey: ["seeker-applications"],
    queryFn: () => messagingApi.seekerApplications(token!),
    enabled: !!token,
  });

  if (q.isLoading) {
    return (
      <Centered>
        <Spinner />
      </Centered>
    );
  }

  if (q.isError) {
    return (
      <Centered title="Ошибка">
        {(q.error as any)?.message ?? "Не удалось загрузить отклики."}
      </Centered>
    );
  }

  const items = q.data ?? [];

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Отклики и приглашения</h1>
        <p className="p" style={{ marginTop: 6 }}>
          Здесь показаны только те диалоги, где компания уже вышла на связь:
          пригласила вас сама или ответила на ваш отклик.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пока нет активных откликов</h2>
          <p className="p" style={{ marginTop: 6 }}>
            Когда компания ответит вам или отправит приглашение, чат появится здесь.
          </p>
        </div>
      ) : (
        <div className="grid">
          {items.map((thread) => (
            <Link
              key={thread.id}
              to={`/inbox/${thread.id}`}
              className="card card-pad"
            >
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {getCompanyTitle(thread)}
                  </div>

                  <div className="small">
                    {getCompanySubtitle(thread)}
                  </div>

                  {thread.vacancy?.title && (
                    <div className="small" style={{ marginTop: 8 }}>
                      Вакансия: {thread.vacancy.title}
                    </div>
                  )}

                  {thread.messages?.[0] && (
                    <div className="small" style={{ marginTop: 8 }}>
                      {thread.messages[0].body}
                    </div>
                  )}

                  {thread.candidateStage && (
                    <div className="small" style={{ marginTop: 8, fontWeight: 700 }}>
                      Статус: {thread.candidateStage}
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