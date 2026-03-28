import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { JobCard } from "../../components/JobCard";
import { companiesApi } from "../../api/endpoints";
import type { CompanyPhoto, CompanyProfile, JobPost } from "../../api/types";
import "../../components/ui.css";
import { useAuth } from "../../auth/AuthProvider";

type TabKey = "about" | "jobs";

export default function PublicCompanyProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { me } = useAuth();

  const [tab, setTab] = useState<TabKey>("about");

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [companyRes, jobsRes] = await Promise.all([
          companiesApi.getById(id),
          companiesApi.getJobs(id),
        ]);

        setCompany(companyRes.company);
        setJobs(jobsRes.items ?? []);
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить профиль компании");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return <div className="surface card-pad">Загрузка профиля компании...</div>;
  }

  if (error) {
    return <div className="surface card-pad editor-alert">{error}</div>;
  }

  if (!company) {
    return <div className="surface card-pad">Компания не найдена.</div>;
  }

  const companyName = company.companyName?.trim() || "Компания";
  const shortDesc = company.companyShortDescription?.trim() || "Краткое описание не указано";
  const cityCountry = [company.companyCity, company.companyCountry].filter(Boolean).join(", ");
  const photos: CompanyPhoto[] = company.photos ?? [];

  const isMyCompany = me?.id === company.user?.id;

  return (
    <div className="editor-page">
      <div className="surface card-pad" style={{ display: "grid", gap: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 999,
              border: "3px solid #111827",
              overflow: "hidden",
              display: "grid",
              placeItems: "center",
              background: "#f8fafc",
              fontSize: 42,
              fontWeight: 800,
            }}
          >
            {company.companyLogoUrl ? (
              <img
                src={company.companyLogoUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>{companyName[0]?.toUpperCase() || "C"}</span>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 900 }}>
              {companyName}
            </div>

            <div style={{ fontSize: 18, color: "#374151" }}>
              {shortDesc}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button
            variant={tab === "about" ? "primary" : "default"}
            onClick={() => setTab("about")}
          >
            О компании
          </Button>

          <Button
            variant={tab === "jobs" ? "primary" : "default"}
            onClick={() => setTab("jobs")}
          >
            Вакансии
          </Button>

          {isMyCompany && (
            <Button onClick={() => navigate("/company/profile")}>
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {tab === "about" && (
        <>
          <div className="surface card-pad">
            <h2>О компании</h2>
            <div style={{ marginTop: 12 }}>
              {company.companyDescription || "Описание не заполнено"}
            </div>
          </div>

          <div className="surface card-pad">
            <h2>Контакты</h2>

            <div style={{ marginTop: 12 }}>
              <div>Сайт: {company.companyWebsite || "-"}</div>
              <div>Телефон: {company.companyPhone || "-"}</div>
              <div>Локация: {cityCountry || "-"}</div>
              <div>Email: {company.user?.email}</div>
            </div>
          </div>

          <div className="surface card-pad">
            <h2>Фотографии</h2>

            {photos.length === 0 ? (
              <div>Нет фотографий</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {photos.map((p) => (
                  <img
                    key={p.id}
                    src={p.imageUrl}
                    style={{ height: 160, objectFit: "cover", cursor: "pointer" }}
                    onClick={() => setSelectedImage(p.imageUrl)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "jobs" && (
        <div className="grid" style={{ gap: 14 }}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={selectedImage}
            style={{ maxWidth: "90%", maxHeight: "90%" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}