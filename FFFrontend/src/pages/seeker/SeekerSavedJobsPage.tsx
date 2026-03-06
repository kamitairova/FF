import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seekerApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import { Link } from "react-router-dom";
import "../../components/ui.css";

export function SeekerSavedJobsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const qs = useMemo(() => `?page=1&pageSize=20`, []);

  const q = useQuery({
    queryKey: ["savedJobs", qs],
    queryFn: () => seekerApi.savedJobs(token!, qs),
    enabled: !!token
  });

  const mut = useMutation({
    mutationFn: (jobId: string) => seekerApi.unsaveJob(token!, jobId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedJobs"] })
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить избранное."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Избранные вакансии</h1>
        <p className="p" style={{ marginTop: 6 }}>Сохранённые вакансии — в стиле «Избранное».</p>
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пусто</h2>
          <p className="p" style={{ marginTop: 6 }}>Добавьте вакансии в избранное со страницы вакансии.</p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((j) => (
            <div key={j.id} className="card card-pad">
              <div className="split">
                <div>
                  <Link to={`/jobs/${j.id}`} style={{ fontWeight: 900 }}>{j.title}</Link>
                  <div className="small">{j.location}</div>
                </div>
                <Button disabled={mut.isPending} onClick={() => mut.mutate(j.id)}>Убрать</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
