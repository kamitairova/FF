import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { seekerApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Pagination } from "../../components/Pagination";
import "../../components/ui.css";

export function SeekerApplicationsPage() {
  const { token } = useAuth();
  const page = 1;
  const pageSize = 20;
  const qs = useMemo(() => `?page=${page}&pageSize=${pageSize}`, [page, pageSize]);

  const q = useQuery({
    queryKey: ["myApplications", qs],
    queryFn: () => seekerApi.myApplications(token!, qs),
    enabled: !!token
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить отклики."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Мои отклики</h1>
        <p className="p" style={{ marginTop: 6 }}>
          Статусы: submitted → reviewed → interview → offer → hired, либо rejected.
        </p>
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пока нет откликов</h2>
          <p className="p" style={{ marginTop: 6 }}>Откликнитесь на вакансию, и она появится здесь.</p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((a) => (
            <div key={a.id} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>{a.job?.title ?? "Вакансия"}</div>
                  <div className="small">{a.job?.location ?? ""}</div>
                </div>
                <div className="badge badge-blue">{a.status}</div>
              </div>
              <div className="small" style={{ marginTop: 10 }}>
                Создано: {new Date(a.createdAt).toLocaleString()} · Обновлено: {new Date(a.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={() => {}} />
        </div>
      )}
    </div>
  );
}
