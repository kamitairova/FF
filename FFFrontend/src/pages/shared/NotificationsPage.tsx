import React, { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import "../../components/ui.css";

export function NotificationsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const qs = useMemo(() => `?page=1&pageSize=50`, []);
  const q = useQuery({
    queryKey: ["notifications", qs],
    queryFn: () => notificationsApi.list(token!, qs),
    enabled: !!token
  });

  const mut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", qs] })
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить уведомления."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Уведомления</h1>
        <p className="p" style={{ marginTop: 6 }}>
          Новое сообщение и изменение статуса отклика создают уведомления и email (на backend).
        </p>
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пока нет уведомлений</h2>
          <p className="p" style={{ marginTop: 6 }}>Когда что-то произойдёт, уведомления появятся здесь.</p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((n) => (
            <div key={n.id} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {n.type === "NEW_MESSAGE" ? "Новое сообщение" : "Статус отклика изменён"}
                    {!n.isRead && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>NEW</span>}
                  </div>
                  <div className="small">{new Date(n.createdAt).toLocaleString()}</div>
                  <pre style={{
                    marginTop: 8,
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "#f8fafc",
                    overflow: "auto"
                  }}>
{JSON.stringify(n.payloadJson ?? null, null, 2)}
                  </pre>
                </div>
                <div>
                  <Button disabled={mut.isPending || n.isRead} onClick={() => mut.mutate(n.id)}>
                    Отметить прочитанным
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
