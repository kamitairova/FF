import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { messagingApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Link } from "react-router-dom";
import "../../components/ui.css";

export function InboxPage() {
  const { token } = useAuth();
  const qs = useMemo(() => `?page=1&pageSize=50`, []);
  const q = useQuery({
    queryKey: ["threads", qs],
    queryFn: () => messagingApi.threads(token!, qs),
    enabled: !!token
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить диалоги."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Сообщения</h1>
        <p className="p" style={{ marginTop: 6 }}>
          REST-чат: список диалогов и сообщения внутри треда.
        </p>
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пока нет диалогов</h2>
          <p className="p" style={{ marginTop: 6 }}>
            Компания может начать чат с кандидатом, а соискатель — отвечать.
          </p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((t) => (
            <Link key={t.id} to={`/inbox/${t.id}`} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>Диалог #{t.id.slice(0, 8)}</div>
                  <div className="small">Создан: {new Date(t.createdAt).toLocaleString()}</div>
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
