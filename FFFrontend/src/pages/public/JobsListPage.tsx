import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "../../api/endpoints";
import { JobPost } from "../../api/types";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Pagination } from "../../components/Pagination";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Link, useSearchParams } from "react-router-dom";
import "./jobs.css";
import "../../components/ui.css";

function money(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  if (min && max) return `${min.toLocaleString()}–${max.toLocaleString()} ₽`;
  if (min) return `от ${min.toLocaleString()} ₽`;
  return `до ${(max ?? 0).toLocaleString()} ₽`;
}

function qsFromParams(p: URLSearchParams) {
  const page = p.get("page") ?? "1";
  const pageSize = p.get("pageSize") ?? "10";
  const next = new URLSearchParams();
  next.set("page", page);
  next.set("pageSize", pageSize);

  for (const k of [
    "q",
    "location",
    "categoryId",
    "salaryMin",
    "salaryMax",
    "employmentType",
    "workMode",
    "experienceLevel",
    "sort",
  ]) {
    const v = p.get(k);
    if (v) next.set(k, v);
  }

  return `?${next.toString()}`;
}

export function JobsListPage() {
  const [sp, setSp] = useSearchParams();
  const [qDraft, setQDraft] = useState(sp.get("q") ?? "");
  const qs = useMemo(() => qsFromParams(sp), [sp]);

  const query = useQuery({
    queryKey: ["jobs", qs],
    queryFn: () => jobsApi.listPublic(), 
  });

  const res = query.data;

  const items: JobPost[] = res?.items ?? [];
  const page = Number(sp.get("page") ?? "1");
  const pageSize = Number(sp.get("pageSize") ?? "10");
  const total = items.length;

  const applyFilters = () => {
    const next = new URLSearchParams(sp);
    if (qDraft.trim()) next.set("q", qDraft.trim());
    else next.delete("q");
    next.set("page", "1");
    if (!next.get("pageSize")) next.set("pageSize", "10");
    setSp(next);
  };

  const setField = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v);
    else next.delete(k);
    next.set("page", "1");
    if (!next.get("pageSize")) next.set("pageSize", "10");
    setSp(next);
  };

  return (
    <div>
      <h1 className="h1">Вакансии</h1>

      {query.isLoading && (
        <div className="card card-pad">
          <Spinner />
        </div>
      )}

      {query.isError && (
        <Centered title="Ошибка загрузки">
          {(query.error as any)?.message ?? "Ошибка"}
        </Centered>
      )}

      {!query.isLoading && items.length === 0 && (
        <div className="card card-pad">
          <h2 className="h2">Ничего не найдено</h2>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid">
          {items.map((job: JobPost) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="card job-card">
              <h3>{job.title}</h3>

              <div>
                {(job.company as any)?.companyName ?? job.company?.email ?? "Компания"}
              </div>

              <div>{(job as any).location ?? "Не указано"}</div>

              <div>
                {money(
                  (job as any).salaryMin ?? null,
                  (job as any).salaryMax ?? null
                )}
              </div>

              <div>
                {(job.description ?? "").slice(0, 100)}
              </div>
            </Link>
          ))}

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPage={(p) => {
              const next = new URLSearchParams(sp);
              next.set("page", String(p));
              setSp(next);
            }}
          />
        </div>
      )}
    </div>
  );
}