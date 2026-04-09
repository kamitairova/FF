import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { Spinner } from "../../components/Spinner";

type Resume = {
  id: number;
  title: string;
  desiredPosition?: string | null;
  salaryExpectation?: number | null;
  skills: string[];
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

export const ResumesListPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: Resume[] }>("/resumes")
      .then((res) => setResumes(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="jobs-container">
      <div className="page-head">
        <div>
          <h1 className="page-title">База резюме</h1>
          <p className="page-subtitle">
            Публичные резюме соискателей
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {resumes.map((r) => (
          <div key={r.id} className="surface card-pad shadow-sm" style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <Link
                  to={`/resumes/${r.id}`}
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  {r.title}
                </Link>

                {r.desiredPosition && (
                  <p style={{ color: "#2563eb", fontWeight: 600, marginTop: 6 }}>
                    {r.desiredPosition}
                  </p>
                )}

                <div style={{ marginTop: 8 }}>
                  <Link
                    to={`/seekers/${r.seekerProfile.id}`}
                    style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}
                  >
                    {r.seekerProfile.firstName} {r.seekerProfile.lastName || ""}
                  </Link>
                </div>

                <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
                  📍 {r.seekerProfile.location || "Город не указан"}
                </p>

                {typeof r.salaryExpectation === "number" && (
                  <p style={{ fontSize: 14, color: "#0f172a", marginTop: 6, fontWeight: 600 }}>
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

              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <Link
                  to={`/resumes/${r.id}`}
                  style={{
                    textDecoration: "none",
                    color: "#fff",
                    background: "#000",
                    padding: "8px 14px",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  Открыть
                </Link>

                {r.resumeFile && (
                  <a
                    href={`http://localhost:5000${r.resumeFile.storagePath}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1",
                      padding: "8px 14px",
                      borderRadius: 8,
                      whiteSpace: "nowrap",
                    }}
                  >
                    PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {!resumes.length && (
          <div className="surface card-pad shadow-sm" style={{ borderRadius: 12 }}>
            <p style={{ color: "#64748b" }}>Резюме пока не найдены.</p>
          </div>
        )}
      </div>
    </div>
  );
};