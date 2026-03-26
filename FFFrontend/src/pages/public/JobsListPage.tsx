import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { jobsApi } from "../../api/endpoints";
import { JobPost } from "../../api/types";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Pagination } from "../../components/Pagination";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import "../../components/ui.css";
import "./jobs.css";

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

const categories = ["Frontend", "Backend", "Fullstack", "Design", "QA", "DevOps", "Mobile"];
const heroSlides = [
  {
    title: "Find work faster",
    text: "Смотри свежие вакансии, откликайся за минуты и держи поиск работы в одном аккуратном пространстве.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "A better hiring flow",
    text: "Баннер сверху, список вакансий по центру и фильтрация справа — как в твоем референсе, только под Fast Find.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Clean and light dashboard",
    text: "Светлая тема, карточки, плавные тени и понятная навигация, чтобы фронтенд выглядел современнее.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
  },
];

export function JobsListPage() {
  const [sp, setSp] = useSearchParams();
  const [qDraft, setQDraft] = useState(sp.get("q") ?? "");
  const [locationDraft, setLocationDraft] = useState(sp.get("location") ?? "");
  const [salaryMinDraft, setSalaryMinDraft] = useState(sp.get("salaryMin") ?? "");
  const [salaryMaxDraft, setSalaryMaxDraft] = useState(sp.get("salaryMax") ?? "");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

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
    <div className="jobs-dashboard">
      <section className="jobs-main jobs-stack">
        <div className="hero-banner">
          {heroSlides.map((item, index) => (
            <div
              key={item.title}
              className={`hero-slide${index === slide ? " active" : ""}`}
              style={{ backgroundImage: `url(${item.image})` }}
            />
          ))}
          <div className="hero-content">
            <div className="hero-kicker">Fast Find</div>
            <h1 className="hero-title">{heroSlides[slide].title}</h1>
            <p className="hero-text">{heroSlides[slide].text}</p>
            <div className="hero-dots">
              {heroSlides.map((item, index) => (
                <span key={item.title} className={`hero-dot${index === slide ? " active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="surface jobs-toolbar">
          <div className="jobs-search-wrap">
            <Input
              className="jobs-search"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              placeholder="Search vacancies, skills, companies"
            />
          </div>
          <Button onClick={applyFilters}>Найти</Button>
        </div>

        <div className="surface card-pad jobs-headline">
          <div className="split">
            <div>
              <h2 className="h2">Главная страница</h2>
              <p className="p">Список вакансий по центру, фильтрация справа и отдельная навигация слева.</p>
            </div>
            <div className="badge badge-blue">Найдено: {total}</div>
          </div>
        </div>

        {query.isLoading && (
          <div className="surface jobs-empty">
            <Centered>
              <Spinner />
            </Centered>
          </div>
        )}

        {query.isError && !query.isLoading && (
          <div className="surface jobs-empty">{(query.error as any)?.message ?? "Ошибка"}</div>
        )}

        {!query.isLoading && !query.isError && items.length === 0 && (
          <div className="surface jobs-empty">
            <h3 className="h2">Ничего не найдено</h3>
            <p className="p" style={{ marginTop: 8 }}>
              Попробуй изменить фильтры или сбросить параметры поиска.
            </p>ы
          </div>
        )}

        {!query.isLoading && !query.isError && items.length > 0 && (
          <div className="jobs-feed">
            {items.map((job: JobPost) => (
              <article key={job.id} className="job-card">
                <div className="job-top">
                  <div>
                    <Link to={`/jobs/${job.id}`}>
                      <h3 className="job-title">{job.title}</h3>
                    </Link>
                    <div className="job-company">{job.company?.email ?? "Компания"}</div>
                    <div className="job-meta">
                      <span>{job.city ?? "Локация не указана"}</span>
                      {job.category && <span>{job.category}</span>}
                      {job.workMode && <span>{job.workMode}</span>}
                      {job.experienceLevel && <span>{job.experienceLevel}</span>}
                    </div>
                  </div>
                  <div className="badge badge-yellow">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "new"}</div>
                </div>

                <p className="job-text">
                  {(job.description ?? "").slice(0, 220)}
                  {(job.description?.length ?? 0) > 220 ? "..." : ""}
                </p>

                {!!job.requiredSkills?.length && (
                  <div className="badges" style={{ marginTop: 14 }}>
                    {job.requiredSkills.slice(0, 6).map((skill) => (
                      <span key={skill} className="badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="job-bottom">
                  <div className="job-salary">{money(job.salaryFrom ?? null, job.salaryTo ?? null) ?? "З/п не указана"}</div>
                  <Link to={`/jobs/${job.id}`}>
                    <Button>Подробнее</Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!query.isLoading && !query.isError && total > pageSize && (
          <div className="surface card-pad">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPage={(p: number) => {
                const next = new URLSearchParams(sp);
                next.set("page", String(p));
                if (!next.get("pageSize")) next.set("pageSize", "10");
                setSp(next);
              }}
            />
          </div>
        )}
      </section>

      <aside className="jobs-rail">
        <div className="filter-sticky">
          <div className="rail-card">
            <div className="profile-mini">
              <div className="profile-avatar">ff</div>
              <div>
                <div style={{ fontWeight: 800 }}>Fast Find</div>
                <div className="small">Light dashboard concept</div>
              </div>
            </div>

            <div className="quick-links">
              <div className="quick-link">
                <span>Remote jobs</span>
                <span>→</span>
              </div>
              <div className="quick-link">
                <span>Design</span>
                <span>→</span>
              </div>
              <div className="quick-link">
                <span>Development</span>
                <span>→</span>
              </div>
              <div className="quick-link">
                <span>Internships</span>
                <span>→</span>
              </div>
            </div>
          </div>

          <div className="rail-card" style={{ marginTop: 18 }}>
            <div className="split">
              <div>
                <h3 className="h2">Фильтрация вакансий</h3>
                <p className="p">Отдельный блок справа, как ты и просил.</p>
              </div>
            </div>

            <div className="filter-group">
              <div>
                <label className="label">Город / локация</label>
                <Input
                  value={locationDraft}
                  onChange={(e) => setLocationDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyFilters();
                  }}
                  placeholder="Bishkek, Remote..."
                />
              </div>

              <div>
                <label className="label">Категория</label>
                <Select value={sp.get("category") ?? ""} onChange={(e) => setField("category", e.target.value)}>
                  <option value="">Все</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="label">Тип занятости</label>
                <Select value={sp.get("employmentType") ?? ""} onChange={(e) => setField("employmentType", e.target.value)}>
                  <option value="">Все</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                </Select>
              </div>

              <div>
                <label className="label">Формат работы</label>
                <Select value={sp.get("workMode") ?? ""} onChange={(e) => setField("workMode", e.target.value)}>
                  <option value="">Все</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                </Select>
              </div>

              <div>
                <label className="label">Опыт</label>
                <Select value={sp.get("experienceLevel") ?? ""} onChange={(e) => setField("experienceLevel", e.target.value)}>
                  <option value="">Все</option>
                  <option value="intern">Intern</option>
                  <option value="junior">Junior</option>
                  <option value="middle">Middle</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </Select>
              </div>

              <div className="grid grid-2">
                <div>
                  <label className="label">Зарплата от</label>
                  <Input value={salaryMinDraft} onChange={(e) => setSalaryMinDraft(e.target.value)} placeholder="500" />
                </div>
                <div>
                  <label className="label">Зарплата до</label>
                  <Input value={salaryMaxDraft} onChange={(e) => setSalaryMaxDraft(e.target.value)} placeholder="3000" />
                </div>
              </div>

              <div>
                <label className="label">Сортировка</label>
                <Select value={sp.get("sort") ?? "createdAt_desc"} onChange={(e) => setField("sort", e.target.value)}>
                  <option value="createdAt_desc">Сначала новые</option>
                  <option value="relevance_desc">По релевантности</option>
                  <option value="salaryFrom_asc">Зарплата по возрастанию</option>
                  <option value="salaryFrom_desc">Зарплата по убыванию</option>
                </Select>
              </div>
            </div>

            <div className="filter-actions">
              <Button onClick={applyFilters}>Применить</Button>
              <Button onClick={resetFilters}>Сбросить</Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
