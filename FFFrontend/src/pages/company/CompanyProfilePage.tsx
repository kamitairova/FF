import React, { useEffect, useMemo, useState } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Textarea } from "../../components/Textarea";
import { JobCard } from "../../components/JobCard";
import { useAuth } from "../../auth/AuthProvider";
import { apiFetch } from "../../api/client";
import { jobsApi } from "../../api/endpoints";
import type { CompanyProfile, JobPost } from "../../api/types";
import "../../components/ui.css";

type CompanyPhoto = {
  id: number;
  imageUrl: string;
  sortOrder: number;
};

type TabKey = "about" | "edit" | "jobs";

const emptyProfile: CompanyProfile = {
  companyName: "",
  companyLogoUrl: "",
  companyShortDescription: "",
  companyDescription: "",
  companyWebsite: "",
  companyPhone: "",
  companyCity: "",
  companyCountry: "",
};

export default function CompanyProfilePage() {
  const { token } = useAuth();

  const [form, setForm] = useState<CompanyProfile>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<CompanyProfile>(emptyProfile);

  const [photos, setPhotos] = useState<CompanyPhoto[]>([]);
  const [newPhoto, setNewPhoto] = useState("");

  const [jobs, setJobs] = useState<JobPost[]>([]);

  const [tab, setTab] = useState<TabKey>("about");
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const profileRes = await apiFetch<{ profile: CompanyProfile }>(
          "/company/profile",
          { token }
        );

        const nextProfile: CompanyProfile = {
          companyName: profileRes.profile?.companyName ?? "",
          companyLogoUrl: profileRes.profile?.companyLogoUrl ?? "",
          companyShortDescription: profileRes.profile?.companyShortDescription ?? "",
          companyDescription: profileRes.profile?.companyDescription ?? "",
          companyWebsite: profileRes.profile?.companyWebsite ?? "",
          companyPhone: profileRes.profile?.companyPhone ?? "",
          companyCity: profileRes.profile?.companyCity ?? "",
          companyCountry: profileRes.profile?.companyCountry ?? "",
          email: profileRes.profile?.email ?? "",
        };

        setForm(nextProfile);
        setSavedProfile(nextProfile);

        const photosRes = await apiFetch<{ photos: CompanyPhoto[] }>(
          "/company/profile/photos",
          { token }
        );

        setPhotos(photosRes.photos ?? []);
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить профиль компании");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  useEffect(() => {
    if (!token || tab !== "jobs") return;

    const loadJobs = async () => {
      try {
        setJobsLoading(true);
        setError("");

        const res = await jobsApi.listMyCompany(token);
        setJobs(res.items ?? []);
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить вакансии компании");
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, [token, tab]);

  const update = (key: keyof CompanyProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedProfile);
  }, [form, savedProfile]);

  const save = async () => {
    if (!token) return;

    try {
      setSaving(true);
      setError("");

      const payload = {
        companyName: form.companyName ?? "",
        companyLogoUrl: form.companyLogoUrl ?? "",
        companyShortDescription: form.companyShortDescription ?? "",
        companyDescription: form.companyDescription ?? "",
        companyWebsite: form.companyWebsite ?? "",
        companyPhone: form.companyPhone ?? "",
        companyCity: form.companyCity ?? "",
        companyCountry: form.companyCountry ?? "",
      };

      const res = await apiFetch<{ profile: CompanyProfile }>("/company/profile", {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
      });

      const nextProfile: CompanyProfile = {
        companyName: res.profile?.companyName ?? "",
        companyLogoUrl: res.profile?.companyLogoUrl ?? "",
        companyShortDescription: res.profile?.companyShortDescription ?? "",
        companyDescription: res.profile?.companyDescription ?? "",
        companyWebsite: res.profile?.companyWebsite ?? "",
        companyPhone: res.profile?.companyPhone ?? "",
        companyCity: res.profile?.companyCity ?? "",
        companyCountry: res.profile?.companyCountry ?? "",
        email: res.profile?.email ?? savedProfile.email ?? "",
      };

      setForm(nextProfile);
      setSavedProfile(nextProfile);
      setTab("about");
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить профиль");
    } finally {
      setSaving(false);
    }
  };

  const addPhoto = async () => {
    if (!token || !newPhoto.trim()) return;

    try {
      setError("");

      const res = await apiFetch<{ photo: CompanyPhoto }>("/company/profile/photos", {
        method: "POST",
        token,
        body: JSON.stringify({ imageUrl: newPhoto.trim() }),
      });

      setPhotos((prev) => [...prev, res.photo]);
      setNewPhoto("");
    } catch (e: any) {
      setError(e?.message || "Не удалось добавить фото");
    }
  };

  const deletePhoto = async (id: number) => {
    if (!token) return;

    try {
      setError("");

      await apiFetch<void>(`/company/profile/photos/${id}`, {
        method: "DELETE",
        token,
      });

      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e?.message || "Не удалось удалить фото");
    }
  };

  if (loading) {
    return <div className="surface card-pad">Загрузка профиля...</div>;
  }

  const companyName = savedProfile.companyName?.trim() || "Название компании";
  const shortDesc =
    savedProfile.companyShortDescription?.trim() || "Краткое описание компании";
  const cityCountry = [savedProfile.companyCity, savedProfile.companyCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="editor-page">
      <div className="surface card-pad" style={{ display: "grid", gap: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px minmax(0, 1fr)",
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
            {savedProfile.companyLogoUrl ? (
              <img
                src={savedProfile.companyLogoUrl}
                alt="Company logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>{companyName[0]?.toUpperCase() || "C"}</span>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.05 }}>
              {companyName}
            </div>

            <div
              style={{
                minHeight: 56,
                padding: "6px 2px",
                fontSize: 18,
                color: "#374151",
                background: "transparent",
              }}
            >
              {shortDesc}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            variant={tab === "edit" ? "primary" : "default"}
            onClick={() => setTab("edit")}
          >
            Редактирование
          </Button>

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
        </div>
      </div>

      {error && <div className="surface card-pad editor-alert">{error}</div>}

      {tab === "about" && (
        <>
          <div className="surface card-pad">
            <h2 className="editor-section-title">О компании</h2>
            <div style={{ marginTop: 12, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {savedProfile.companyDescription?.trim() || "Описание пока не заполнено."}
            </div>
          </div>

          <div className="surface card-pad">
            <h2 className="editor-section-title">Контакты</h2>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Сайт
                </div>
                <div style={{ marginTop: 6 }}>
                  {savedProfile.companyWebsite ? (
                    <a
                      href={savedProfile.companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {savedProfile.companyWebsite}
                    </a>
                  ) : (
                    "Не указан"
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Телефон
                </div>
                <div style={{ marginTop: 6 }}>
                  {savedProfile.companyPhone || "Не указан"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Локация
                </div>
                <div style={{ marginTop: 6 }}>{cityCountry || "Не указана"}</div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Email
                </div>
                <div style={{ marginTop: 6 }}>{savedProfile.email || "Не указан"}</div>
              </div>
            </div>
          </div>

          <div className="surface card-pad">
            <h2 className="editor-section-title">Фотографии</h2>

            {photos.length === 0 ? (
              <div style={{ marginTop: 12, color: "#6b7280" }}>
                Фотографии пока не добавлены.
              </div>
            ) : (
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      borderRadius: 18,
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "#f8fafc",
                      minHeight: 180,
                    }}
                  >
                    <img
                      src={photo.imageUrl}
                      alt="Company"
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "edit" && (
        <>
          <div className="surface card-pad" style={{ display: "grid", gap: 16 }}>
            <h2 className="editor-section-title">Редактирование профиля</h2>

            <div className="editor-two">
              <Input
                placeholder="Название компании"
                value={form.companyName ?? ""}
                onChange={(e) => update("companyName", e.target.value)}
              />
              <Input
                placeholder="URL логотипа"
                value={form.companyLogoUrl ?? ""}
                onChange={(e) => update("companyLogoUrl", e.target.value)}
              />
            </div>

            <Input
              placeholder="Короткое описание"
              value={form.companyShortDescription ?? ""}
              onChange={(e) => update("companyShortDescription", e.target.value)}
            />

            <Textarea
              placeholder="Полное описание компании"
              value={form.companyDescription ?? ""}
              onChange={(e) => update("companyDescription", e.target.value)}
            />

            <div className="editor-two">
              <Input
                placeholder="Сайт"
                value={form.companyWebsite ?? ""}
                onChange={(e) => update("companyWebsite", e.target.value)}
              />
              <Input
                placeholder="Телефон"
                value={form.companyPhone ?? ""}
                onChange={(e) => update("companyPhone", e.target.value)}
              />
            </div>

            <div className="editor-two">
              <Input
                placeholder="Город"
                value={form.companyCity ?? ""}
                onChange={(e) => update("companyCity", e.target.value)}
              />
              <Input
                placeholder="Страна"
                value={form.companyCountry ?? ""}
                onChange={(e) => update("companyCountry", e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button variant="primary" onClick={save} disabled={saving || !hasChanges}>
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </Button>

              <Button
                onClick={() => {
                  setForm(savedProfile);
                  setError("");
                }}
                disabled={!hasChanges}
              >
                Сбросить
              </Button>
            </div>
          </div>

          <div className="surface card-pad" style={{ display: "grid", gap: 16 }}>
            <h2 className="editor-section-title">Фото компании</h2>

            <div className="editor-two">
              <Input
                placeholder="URL фотографии"
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
              />
              <Button variant="primary" onClick={addPhoto}>
                Добавить фото
              </Button>
            </div>

            {photos.length === 0 ? (
              <div style={{ color: "#6b7280" }}>Пока нет фото.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr auto",
                      gap: 14,
                      alignItems: "center",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <img
                      src={photo.imageUrl}
                      alt="Company"
                      style={{
                        width: 100,
                        height: 72,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />

                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "#374151",
                      }}
                    >
                      {photo.imageUrl}
                    </div>

                    <Button onClick={() => deletePhoto(photo.id)}>Удалить</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "jobs" && (
        <div className="grid" style={{ gap: 14 }}>
          <div className="surface card-pad">
            <h2 className="editor-section-title">Вакансии компании</h2>
            <div style={{ marginTop: 8, color: "#6b7280" }}>
              Здесь отображаются все вакансии вашей компании, включая pending.
            </div>
          </div>

          {jobsLoading ? (
            <div className="surface card-pad">Загрузка вакансий...</div>
          ) : jobs.length === 0 ? (
            <div className="surface card-pad">У компании пока нет вакансий.</div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      )}
    </div>
  );
}