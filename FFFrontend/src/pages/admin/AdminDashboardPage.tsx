import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import "../../components/ui.css";

export function AdminDashboardPage() {
  const { token } = useAuth();
  const q = useQuery({
    queryKey: ["adminMetrics"],
    queryFn: () => adminApi.metrics(token!),
    enabled: !!token
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить метрики."}</Centered>;

  const m = q.data ?? {};
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Админ: метрики</h1>
        <p className="p" style={{ marginTop: 6 }}>Сводные счётчики пользователей/вакансий/откликов.</p>
      </div>

      <div className="card card-pad">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(m, null, 2)}</pre>
      </div>
    </div>
  );
}
