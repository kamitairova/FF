import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import { Link, useNavigate } from "react-router-dom";
import "../../components/ui.css";

export function CompanyJobsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();

  const q = useQuery({
    queryKey: ["companyJobs"],
    queryFn: () => jobsApi.listCompany(token!),
    enabled: !!token
  });

  const del = useMutation({
    mutationFn: (jobId: string) => jobsApi.deleteCompany(token!, jobId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companyJobs"] })
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить вакансии."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">Мои вакансии</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Новые вакансии создаются со статусом <b>PENDING</b> и становятся публичными после модерации админом.
            </p>
          </div>
          <Button variant="primary" onClick={() => nav("/company/jobs/new")}>Создать вакансию</Button>
        </div>
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пока нет вакансий</h2>
          <p className="p" style={{ marginTop: 6 }}>Создайте первую вакансию.</p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((j) => (
            <div key={j.id} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>{j.title}</div>
                  <div className="small">{j.location}</div>
                  <div className="badges" style={{ marginTop: 8 }}>
                    <span className="badge badge-blue">{j.status ?? "PENDING"}</span>
                    {j.workMode ? <span className="badge">{j.workMode}</span> : null}
                    {j.employmentType ? <span className="badge">{j.employmentType}</span> : null}
                  </div>
                </div>
                <div className="toolbar">
                  <Button onClick={() => nav(`/company/jobs/${j.id}/applicants`)}>Отклики</Button>
                  <Button onClick={() => nav(`/company/jobs/${j.id}/edit`)}>Редактировать</Button>
                  <Button variant="danger" disabled={del.isPending} onClick={() => del.mutate(j.id)}>Удалить</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
