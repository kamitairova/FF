import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "../../api/endpoints";
import { JobApplicationStatus } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import "../../components/ui.css";

const transitions: Record<JobApplicationStatus, JobApplicationStatus[]> = {
  submitted: ["reviewed", "rejected"],
  reviewed: ["interview", "rejected"],
  interview: ["offer", "rejected"],
  offer: ["hired", "rejected"],
  hired: [],
  rejected: []
};

export function CompanyApplicantsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { jobId } = useParams();
  const [info, setInfo] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["applicants", jobId],
    queryFn: () => jobsApi.listApplicants(token!, jobId!),
    enabled: !!token && !!jobId
  });

  const mut = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: JobApplicationStatus }) =>
      jobsApi.updateApplicationStatus(token!, applicationId, status),
    onSuccess: () => {
      setInfo("Статус обновлён. Соискатель получит уведомление.");
      qc.invalidateQueries({ queryKey: ["applicants", jobId] });
    },
    onError: (e: any) => setInfo(e?.message ?? "Не удалось обновить статус.")
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить отклики."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Отклики на вакансию</h1>
        <p className="p" style={{ marginTop: 6 }}>
          Доступны только валидные переходы статусов (согласно state machine).
        </p>
        {info && <div className="small" style={{ marginTop: 8, fontWeight: 800 }}>{info}</div>}
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Откликов пока нет</h2>
          <p className="p" style={{ marginTop: 6 }}>Когда соискатели откликнутся, они появятся здесь.</p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((a) => (
            <div key={a.id} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>{a.seeker?.fullName ?? "Соискатель"}</div>
                  <div className="small">{a.seeker?.headline ?? ""}</div>
                  <div className="badges" style={{ marginTop: 8 }}>
                    {(a.seeker?.skills ?? []).slice(0, 8).map((s) => <span key={s} className="badge">{s}</span>)}
                  </div>
                </div>
                <div style={{ minWidth: 230 }}>
                  <div className="small" style={{ fontWeight: 900, marginBottom: 6 }}>Статус</div>
                  <div className="toolbar">
                    <span className="badge badge-blue">{a.status}</span>
                    <Select
                      value=""
                      onChange={(e) => {
                        const next = e.target.value as JobApplicationStatus;
                        if (!next) return;
                        mut.mutate({ applicationId: a.id, status: next });
                        e.currentTarget.value = "";
                      }}
                    >
                      <option value="">Изменить…</option>
                      {transitions[a.status].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              <div className="small" style={{ marginTop: 10 }}>
                Отклик: {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
