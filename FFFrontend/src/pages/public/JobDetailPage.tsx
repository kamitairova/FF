import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "../../api/endpoints";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { useAuth } from "../../auth/AuthProvider";
import "../../components/ui.css";

function money(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  if (min && max) return `${min.toLocaleString()}–${max.toLocaleString()} ₽`;
  if (min) return `от ${min.toLocaleString()} ₽`;
  return `до ${(max ?? 0).toLocaleString()} ₽`;
}

export function JobDetailPage() {
  const { jobId } = useParams();
  const nav = useNavigate();
  const { token, me } = useAuth();
  const [info, setInfo] = useState<string | null>(null);

  const idNum = Number(jobId);
  const hasValidId = Number.isFinite(idNum) && idNum > 0;

  const q = useQuery({
    queryKey: ["job", idNum],
    queryFn: () => jobsApi.getPublic(idNum),
    enabled: hasValidId,
  });

  const canSeeker = !!token && me?.role === "JOB_SEEKER";

  if (!hasValidId) {
    return <Centered title="Ошибка">Некорректный id вакансии</Centered>;
  }

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return (
    <Centered title="Ошибка">
      {(q.error as any)?.message ?? "Не удалось загрузить вакансию."}
    </Centered>
  );

  const job = q.data!.job;

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <div style={{ color: "var(--muted)", fontWeight: 800, fontSize: 13 }}>
              <Link to="/">Вакансии</Link> <span style={{ opacity: 0.6 }}> / </span> {job.title}
            </div>

            <h1 className="h1" style={{ marginTop: 8 }}>{job.title}</h1>

            <div className="kv" style={{ marginTop: 8 }}>
              <span><b>{job.company?.email ?? "Компания"}</b></span>
              <span>{job.city ?? "Город не указан"}</span>
              <span className="badge">{job.status}</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              {money(job.salaryFrom ?? null, job.salaryTo ?? null) ?? "З/п не указана"}
            </div>
            <div className="small" style={{ marginTop: 6 }}>
              {job.createdAt ? `Опубликовано: ${new Date(job.createdAt).toLocaleDateString()}` : ""}
            </div>
          </div>
        </div>

        <div className="hr" style={{ margin: "14px 0" }} />

        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
          {job.description}
        </div>

        {info && <div className="small" style={{ marginTop: 12, fontWeight: 800 }}>{info}</div>}

        <div className="toolbar" style={{ marginTop: 14 }}>
          {!token ? (
            <>
              <Button variant="primary" onClick={() => nav("/login", { state: { from: `/jobs/${jobId}` } })}>
                Войти, чтобы откликнуться
              </Button>
              <Button onClick={() => nav("/login", { state: { from: `/jobs/${jobId}` } })}>
                Войти, чтобы сохранить
              </Button>
            </>
          ) : !canSeeker ? (
            <div className="small">
              Отклики и избранное доступны только для роли <b>JOB_SEEKER</b>.
            </div>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => setInfo("Apply/Save пока не реализованы в backend (нужно добавить эндпоинты).")}
              >
                Откликнуться
              </Button>
              <Button onClick={() => setInfo("Saved jobs пока не реализованы в backend.")}>
                В избранное
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}