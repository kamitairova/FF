import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import "../../components/ui.css";

type Resume = {
  id: number;
  title: string;
  desiredPosition?: string | null;
  salaryExpectation?: number | null;
  experienceLevel?: string | null;
  skills?: string[];
  updatedAt: string;
  resumeFile?: {
    storagePath: string;
  } | null;
  seekerProfile: {
    id: number;
    firstName: string;
    lastName?: string | null;
    location?: string | null;
  };
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function ResumeFilters({
  searchParams,
  setSearchParams,
  locationDraft,
  setLocationDraft,
  salaryMinDraft,
  setSalaryMinDraft,
  salaryMaxDraft,
  setSalaryMaxDraft,
  applyFilters,
  resetFilters,
}: {
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
  locationDraft: string;
  setLocationDraft: (v: string) => void;
  salaryMinDraft: string;
  setSalaryMinDraft: (v: string) => void;
  salaryMaxDraft: string;
  setSalaryMaxDraft: (v: string) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}) {
  const setField = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
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

      <div className="grid grid-2">
        <div>
          <label className="label">Зарплата от</label>
          <Input
            type="number"
            min={0}
            step={50}
            placeholder="0"
            value={salaryMinDraft}
            onChange={(e) => setSalaryMinDraft(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Зарплата до</label>
          <Input
            type="number"
            min={0}
            step={50}
            placeholder="0"
            value={salaryMaxDraft}
            onChange={(e) => setSalaryMaxDraft(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Опыт</label>
        <Select
          value={searchParams.get("experienceLevel") ?? ""}
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
          value={searchParams.get("sort") ?? "updated_desc"}
          onChange={(e) => setField("sort", e.target.value)}
        >
          <option value="updated_desc">Сначала новые</option>
          <option value="updated_asc">Сначала старые</option>
          <option value="salary_desc">Зарплата по убыванию</option>
          <option value="salary_asc">Зарплата по возрастанию</option>
          <option value="name_asc">По имени</option>
        </Select>
      </div>

      <div className="toolbar" style={{ marginTop: 4 }}>
        <Button variant="primary" onClick={applyFilters}>
          Применить
        </Button>
        <Button onClick={resetFilters}>Сбросить</Button>
      </div>
    </div>
  );
}

export const ResumesListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allResumes, setAllResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [qDraft, setQDraft] = useState(searchParams.get("q") ?? "");
  const [locationDraft, setLocationDraft] = useState(searchParams.get("location") ?? "");
  const [salaryMinDraft, setSalaryMinDraft] = useState(searchParams.get("salaryMin") ?? "");
  const [salaryMaxDraft, setSalaryMaxDraft] = useState(searchParams.get("salaryMax") ?? "");

  useEffect(() => {
    setLoading(true);
    setError("");

    apiFetch<{ data: Resume[] }>("/resumes")
      .then((res) => {
        setAllResumes(res.data ?? []);
      })
      .catch((e: any) => {
        setError(e?.message || "Не удалось загрузить резюме");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);

    if (qDraft.trim()) next.set("q", qDraft.trim());
    else next.delete("q");

    if (locationDraft.trim()) next.set("location", locationDraft.trim());
    else next.delete("location");

    if (salaryMinDraft.trim()) next.set("salaryMin", salaryMinDraft.trim());
    else next.delete("salaryMin");

    if (salaryMaxDraft.trim()) next.set("salaryMax", salaryMaxDraft.trim());
    else next.delete("salaryMax");

    setSearchParams(next);
  };

  const resetFilters = () => {
    setQDraft("");
    setLocationDraft("");
    setSalaryMinDraft("");
    setSalaryMaxDraft("");
    setSearchParams(new URLSearchParams());
  };

  const filteredResumes = useMemo(() => {
    const q = normalize(searchParams.get("q") ?? "");
    const location = normalize(searchParams.get("location") ?? "");
    const salaryMin = Number(searchParams.get("salaryMin") ?? "");
    const salaryMax = Number(searchParams.get("salaryMax") ?? "");
    const experienceLevel = searchParams.get("experienceLevel") ?? "";
    const sort = searchParams.get("sort") ?? "updated_desc";

    let items = [...allResumes].filter((resume) => {
      const seekerName = `${resume.seekerProfile.firstName ?? ""} ${resume.seekerProfile.lastName ?? ""}`.trim();
      const haystack = [
        resume.title,
        resume.desiredPosition,
        seekerName,
        resume.seekerProfile.location,
        ...(resume.skills ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQ = !q || haystack.includes(q);

      const matchesLocation =
        !location ||
        (resume.seekerProfile.location ?? "").toLowerCase().includes(location);

      const salary = resume.salaryExpectation ?? 0;
      const matchesSalaryMin = !searchParams.get("salaryMin") || salary >= salaryMin;
      const matchesSalaryMax = !searchParams.get("salaryMax") || salary <= salaryMax;

      const matchesExperience =
        !experienceLevel || resume.experienceLevel === experienceLevel;

      return (
        matchesQ &&
        matchesLocation &&
        matchesSalaryMin &&
        matchesSalaryMax &&
        matchesExperience
      );
    });

    items.sort((a, b) => {
      if (sort === "salary_desc") {
        return (b.salaryExpectation ?? 0) - (a.salaryExpectation ?? 0);
      }

      if (sort === "salary_asc") {
        return (a.salaryExpectation ?? 0) - (b.salaryExpectation ?? 0);
      }

      if (sort === "name_asc") {
        const aName = `${a.seekerProfile.firstName} ${a.seekerProfile.lastName ?? ""}`.trim();
        const bName = `${b.seekerProfile.firstName} ${b.seekerProfile.lastName ?? ""}`.trim();
        return aName.localeCompare(bName, "ru");
      }

      if (sort === "updated_asc") {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return items;
  }, [allResumes, searchParams]);

  const filtersRoot =
    typeof document !== "undefined"
      ? document.getElementById("page-filters-root")
      : null;

  if (loading) {
    return (
      <div className="surface card-pad">
        <p>Загрузка резюме...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface card-pad">
        <p style={{ color: "crimson" }}>{error}</p>
      </div>
    );
  }

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
            <h1 className="h1">Резюме</h1>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              minWidth: 420,
              flex: 1,
              maxWidth: 560,
            }}
          >
            <Input
              placeholder="Должность, навык или имя кандидата"
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

      {filtersRoot &&
        createPortal(
          <ResumeFilters
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            locationDraft={locationDraft}
            setLocationDraft={setLocationDraft}
            salaryMinDraft={salaryMinDraft}
            setSalaryMinDraft={setSalaryMinDraft}
            salaryMaxDraft={salaryMaxDraft}
            setSalaryMaxDraft={setSalaryMaxDraft}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
          />,
          filtersRoot
        )}

      <div className="small" style={{ fontWeight: 800 }}>
        Найдено резюме: {filteredResumes.length}
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {filteredResumes.map((r) => (
          <div
            key={r.id}
            onClick={() => navigate(`/resumes/${r.id}`)}
            className="surface card-pad shadow-sm"
            style={{
              borderRadius: 12,
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(15, 23, 42, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {r.title}
                </div>

                {r.desiredPosition && (
                  <p style={{ color: "#2563eb", fontWeight: 600, marginTop: 6 }}>
                    {r.desiredPosition}
                  </p>
                )}

                {/* 👇 ВАЖНО: ссылка на профиль */}
                <Link
                  to={`/seekers/${r.seekerProfile.id}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    fontWeight: 600,
                    color: "#0f172a",
                    textDecoration: "none",
                  }}
                >
                  {r.seekerProfile.firstName} {r.seekerProfile.lastName || ""}
                </Link>

                <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
                  📍 {r.seekerProfile.location || "Город не указан"}
                </p>

                {typeof r.salaryExpectation === "number" && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "#0f172a",
                      marginTop: 6,
                      fontWeight: 600,
                    }}
                  >
                    Ожидаемая зарплата: {r.salaryExpectation}
                  </p>
                )}

                {!!r.skills?.length && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {r.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          background: "#f1f5f9",
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 12,
                          color: "#334155",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {!filteredResumes.length && (
          <div className="surface card-pad shadow-sm" style={{ borderRadius: 12 }}>
            <p style={{ color: "#64748b" }}>Резюме пока не найдены.</p>
          </div>
        )}
      </div>
    </div>
  );
};