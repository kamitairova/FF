import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { jobsApi, messagingApi, resumesApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "../../components/Button";

type ResumeDetail = {
  id: number;
  title: string;
  desiredPosition?: string | null;
  salaryExpectation?: number | null;
  experienceLevel?: string | null;
  skills?: string[];
  status?: string;
  updatedAt?: string;
  resumeFile?: {
    id: number;
    fileName: string;
    mimeType?: string;
    url?: string;
  } | null;
  seekerProfile?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    location?: string | null;
    headline?: string | null;
    avatarUrl?: string | null;
  };
};

function getFullName(resume: ResumeDetail | null) {
  const first = resume?.seekerProfile?.firstName ?? "";
  const last = resume?.seekerProfile?.lastName ?? "";
  return `${first} ${last}`.trim() || "Соискатель";
}

function getFileKind(file?: ResumeDetail["resumeFile"]) {
  const mime = file?.mimeType?.toLowerCase() ?? "";
  const url = file?.url?.toLowerCase() ?? "";

  const isPdf = mime.includes("pdf") || url.endsWith(".pdf");
  const isImage =
    mime.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif|bmp)$/i.test(url);

  return {
    isPdf,
    isImage,
    canPreviewInline: isPdf || isImage,
  };
}

export default function PublicResumeDetailPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { token, me } = useAuth();

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("");
  const [inviteInfo, setInviteInfo] = useState<string>("");

  useEffect(() => {
    if (!resumeId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch<any>(`/resumes/${resumeId}`, {
          method: "GET",
          token,
        });

        const normalized = response?.resume ?? response;
        setResume(normalized);
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить резюме");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [resumeId, token]);

  const canInvite = !!token && me?.role === "COMPANY";

  const companyJobsQuery = useQuery({
    queryKey: ["company-jobs-for-invite"],
    queryFn: () => jobsApi.listMyCompany(token!),
    enabled: canInvite,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVacancyId) {
        throw new Error("Сначала выберите вакансию");
      }

      const seekerProfileId = resume?.seekerProfile?.id;
      if (!seekerProfileId) {
        throw new Error("Не найден профиль соискателя");
      }

      return messagingApi.invite(token!, {
        seekerProfileId,
        vacancyId: Number(selectedVacancyId),
      });
    },
    onSuccess: (result: any) => {
      setInviteInfo("");
      navigate(`/inbox/${result.id}`);
    },
    onError: (e: any) => {
      setInviteInfo(e?.message || "Не удалось отправить приглашение");
    },
  });

  const fullName = useMemo(() => getFullName(resume), [resume]);
  const avatarLetter = fullName?.[0]?.toUpperCase() || "S";
  const file = resume?.resumeFile;
  const fileKind = getFileKind(file);

  const jobs = companyJobsQuery.data?.items ?? [];

  const myResumesQuery = useQuery({
    queryKey: ["my-resumes-for-check"],
    queryFn: () => resumesApi.mine(token!),
    enabled: !!token && me?.role === "USER",
  });

  const myResumeIds = new Set((myResumesQuery.data?.data ?? []).map((item: any) => item.id));

  const isMyResume =
    me?.role === "USER" &&
    !!resume?.id &&
    myResumeIds.has(resume.id);

  if (error) {
    return (
      <div className="surface card-pad">
        <p style={{ color: "crimson" }}>{error}</p>
      </div>
    );
  }

  if (!resume) {
    return <div className="surface card-pad">Резюме не найдено.</div>;
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="surface card-pad">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px minmax(0, 1fr)",
            gap: 22,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 24,
              overflow: "hidden",
              background: "#e5e7eb",
              display: "grid",
              placeItems: "center",
              fontSize: 44,
              fontWeight: 800,
              color: "#475569",
            }}
          >
            {resume.seekerProfile?.avatarUrl ? (
              <img
                src={resume.seekerProfile.avatarUrl}
                alt={fullName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              avatarLetter
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <span className="badge badge-blue">Резюме</span>
              {resume.status ? <span className="badge">{resume.status}</span> : null}
              {isMyResume ? <span className="badge badge-blue">Это моё резюме</span> : null}
            </div>

            <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>{fullName}</h1>

            <div style={{ marginTop: 8, color: "#334155", fontSize: 18 }}>
              {resume.desiredPosition || resume.title}
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              {resume.seekerProfile?.location ? <span>{resume.seekerProfile.location}</span> : null}
              {resume.experienceLevel ? <span>{resume.experienceLevel}</span> : null}
              {resume.salaryExpectation ? <span>{resume.salaryExpectation} сом</span> : null}
            </div>

            {resume.seekerProfile?.headline ? (
              <p style={{ marginTop: 14, marginBottom: 0, color: "#475569" }}>
                {resume.seekerProfile.headline}
              </p>
            ) : null}

            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {resume.seekerProfile?.id ? (
                <Link to={`/seekers/${resume.seekerProfile.id}`}>
                  Перейти в профиль соискателя
                </Link>
              ) : null}

              {isMyResume ? (
                <Link to={`/seeker/resumes/${resume.id}/edit`} className="btn btn-secondary">
                  Редактировать
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {canInvite && !isMyResume && (
        <div className="surface card-pad">
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Пригласить кандидата</div>

            {companyJobsQuery.isLoading ? (
              <div style={{ color: "#64748b" }}>Загрузка вакансий…</div>
            ) : jobs.length === 0 ? (
              <div style={{ color: "#64748b" }}>
                У вашей компании пока нет вакансий. Сначала создайте вакансию.
              </div>
            ) : (
              <>
                <select
                  value={selectedVacancyId}
                  onChange={(e) => setSelectedVacancyId(e.target.value)}
                  style={{
                    minHeight: 44,
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    padding: "0 12px",
                    fontSize: 15,
                    background: "#fff",
                  }}
                >
                  <option value="">Выберите вакансию</option>
                  {jobs.map((job: any) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>

                <div>
                  <Button
                    variant="primary"
                    disabled={!selectedVacancyId || inviteMutation.isPending}
                    onClick={() => inviteMutation.mutate()}
                  >
                    {inviteMutation.isPending ? "Создание чата..." : "Пригласить"}
                  </Button>
                </div>

                {inviteInfo ? (
                  <div style={{ color: "crimson", fontWeight: 700 }}>{inviteInfo}</div>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      <div className="surface card-pad">
        <h2 style={{ marginTop: 0 }}>Основная информация</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <div className="surface" style={{ padding: 14 }}>
            <div style={{ color: "#64748b", fontSize: 13 }}>Название резюме</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>{resume.title}</div>
          </div>

          <div className="surface" style={{ padding: 14 }}>
            <div style={{ color: "#64748b", fontSize: 13 }}>Желаемая позиция</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {resume.desiredPosition || "Не указана"}
            </div>
          </div>

          <div className="surface" style={{ padding: 14 }}>
            <div style={{ color: "#64748b", fontSize: 13 }}>Опыт</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {resume.experienceLevel || "Не указан"}
            </div>
          </div>

          <div className="surface" style={{ padding: 14 }}>
            <div style={{ color: "#64748b", fontSize: 13 }}>Ожидаемая зарплата</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {resume.salaryExpectation ? `${resume.salaryExpectation} сом` : "Не указана"}
            </div>
          </div>
        </div>
      </div>

      <div className="surface card-pad">
        <h2 style={{ marginTop: 0 }}>Навыки</h2>

        {resume.skills && resume.skills.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {resume.skills.map((skill, idx) => (
              <span
                key={`${skill}-${idx}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: "#64748b", marginBottom: 0 }}>Навыки не указаны.</p>
        )}
      </div>

      <div className="surface card-pad">
        <h2 style={{ marginTop: 0 }}>Файл резюме</h2>

        {!file?.url ? (
          <p style={{ color: "#64748b", marginBottom: 0 }}>Файл не прикреплён.</p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ color: "#475569" }}>
              <strong>{file.fileName}</strong>
              {file.mimeType ? ` • ${file.mimeType}` : ""}
            </div>

            {fileKind.canPreviewInline ? (
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {fileKind.isPdf ? (
                  <iframe
                    title={file.fileName}
                    src={file.url}
                    style={{
                      width: "100%",
                      height: 720,
                      border: "none",
                    }}
                  />
                ) : fileKind.isImage ? (
                  <img
                    src={file.url}
                    alt={file.fileName}
                    style={{
                      display: "block",
                      width: "100%",
                      maxHeight: 900,
                      objectFit: "contain",
                      background: "#f8fafc",
                    }}
                  />
                ) : null}
              </div>
            ) : (
              <a href={file.url} target="_blank" rel="noreferrer">
                Открыть файл
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}