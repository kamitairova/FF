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
  const next = new URLSearchParams();

  next.set("page", p.get("page") ?? "1");
  next.set("pageSize", p.get("pageSize") ?? "10");

  for (const k of [
    "q",
    "location",
    "category",
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

const categories = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Design",
  "QA",
  "DevOps",
  "Mobile",
];

export function JobsListPage() {
  const [sp, setSp] = useSearchParams();

  const [qDraft, setQDraft] = useState(sp.get("q") ?? "");
  const [locationDraft, setLocationDraft] = useState(sp.get("location") ?? "");
  const [salaryMinDraft, setSalaryMinDraft] = useState(sp.get("salaryMin") ?? "");
  const [salaryMaxDraft, setSalaryMaxDraft] = useState(sp.get("salaryMax") ?? "");

  const qs = useMemo(() => qsFromParams(sp), [sp]);

  const query = useQuery({
    queryKey: ["jobs", qs],
    queryFn: () => jobsApi.listPublic(qs),
  });

  const res = query.data;
  const items: JobPost[] = res?.data ?? [];
  const page = res?.page ?? Number(sp.get("page") ?? "1");
  const pageSize = res?.pageSize ?? Number(sp.get("pageSize") ?? "10");
  const total = res?.total ?? 0;

  const applyFilters = () => {
    const next = new URLSearchParams(sp);

    if (qDraft.trim()) next.set("q", qDraft.trim());
    else next.delete("q");

    if (locationDraft.trim()) next.set("location", locationDraft.trim());
    else next.delete("location");

    if (salaryMinDraft.trim()) next.set("salaryMin", salaryMinDraft.trim());
    else next.delete("salaryMin");

    if (salaryMaxDraft.trim()) next.set("salaryMax", salaryMaxDraft.trim());
    else next.delete("salaryMax");

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

  const resetFilters = () => {
    setQDraft("");
    setLocationDraft("");
    setSalaryMinDraft("");
    setSalaryMaxDraft("");
    setSp(new URLSearchParams({ page: "1", pageSize: "10" }));
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="surface card-pad">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="h1">Вакансии</h1>
            <p className="p" style={{ marginTop: 6 }}></p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              minWidth: 420,
              flex: 1,
              maxWidth: 520,
            }}
          >
            <Input
              placeholder="Профессия, должность или компания."
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
            />
            <Button variant="primary" onClick={applyFilters}>
              Найти
            </Button>
          </div>
        </div>
      </div>

      <div className="jobs-layout">
        <aside className="sidebar-sticky">
          <div className="card card-pad grid">

            <div>
              <label className="label">Город / локация</label>
              <Input
                placeholder="Например: Bishkek"
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
            </div>

            <div>
              <label className="label">Категория</label>
              <Select
                value={sp.get("category") ?? ""}
                onChange={(e) => setField("category", e.target.value)}
              >
                <option value="">Все</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-2">
              <div>
                <label className="label">Зарплата от</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={salaryMinDraft}
                  onChange={(e) => setSalaryMinDraft(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Зарплата до</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={salaryMaxDraft}
                  onChange={(e) => setSalaryMaxDraft(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Тип занятости</label>
              <Select
                value={sp.get("employmentType") ?? ""}
                onChange={(e) => setField("employmentType", e.target.value)}
              >
                <option value="">Все</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
              </Select>
            </div>

            <div>
              <label className="label">Формат работы</label>
              <Select
                value={sp.get("workMode") ?? ""}
                onChange={(e) => setField("workMode", e.target.value)}
              >
                <option value="">Все</option>
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
              </Select>
            </div>

            <div>
              <label className="label">Опыт</label>
              <Select
                value={sp.get("experienceLevel") ?? ""}
                onChange={(e) => setField("experienceLevel", e.target.value)}
              >
                <option value="">Все</option>
                <option value="INTERN">Intern</option>
                <option value="JUNIOR">Junior</option>
                <option value="MIDDLE">Middle</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
              </Select>
            </div>

            <div>
              <label className="label">Сортировка</label>
              <Select
                value={sp.get("sort") ?? "newest"}
                onChange={(e) => setField("sort", e.target.value)}
              >
                <option value="newest">Сначала новые</option>
                <option value="relevance">По релевантности</option>
                <option value="salary_asc">Зарплата по возрастанию</option>
                <option value="salary_desc">Зарплата по убыванию</option>
              </Select>
            </div>

            <div className="toolbar">
              <Button variant="primary" onClick={applyFilters}>
                Применить
              </Button>
              <Button onClick={resetFilters}>Сбросить</Button>
            </div>
          </div>
        </aside>

        <section className="grid">
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
              <p className="p" style={{ marginTop: 6 }}>
                Попробуй изменить фильтры или сбросить поиск.
              </p>
            </div>
          )}

          {items.length > 0 && (
            <>
              <div className="small" style={{ fontWeight: 800 }}>
                Найдено вакансий: {total}
              </div>

              {items.map((job: JobPost) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="card job-card">
                  <div className="split">
                    <div style={{ flex: 1 }}>
                      <h3 className="job-title">{job.title}</h3>

                      <div className="job-meta">
                        <span>{job.company?.email ?? "Компания"}</span>
                        <span>{job.city ?? "Локация не указана"}</span>
                        {job.category && <span>{job.category}</span>}
                        {job.workMode && <span>{job.workMode}</span>}
                        {job.experienceLevel && <span>{job.experienceLevel}</span>}
                      </div>

                      <div style={{ marginTop: 10, lineHeight: 1.5 }}>
                        {(job.description ?? "").slice(0, 180)}
                        {(job.description?.length ?? 0) > 180 ? "..." : ""}
                      </div>

                      {!!job.requiredSkills?.length && (
                        <div className="badges" style={{ marginTop: 10 }}>
                          {job.requiredSkills.slice(0, 5).map((skill) => (
                            <span key={skill} className="badge">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ minWidth: 170, textAlign: "right" }}>
                      <div className="job-salary">
                        {money(job.salaryFrom ?? null, job.salaryTo ?? null) ?? "З/п не указана"}
                      </div>
                      <div className="small" style={{ marginTop: 8 }}>
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
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
                  if (!next.get("pageSize")) next.set("pageSize", "10");
                  setSp(next);
                }}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}