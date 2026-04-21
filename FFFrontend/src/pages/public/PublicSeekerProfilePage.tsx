import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../components/Button";
import { publicSeekersApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import "../../components/ui.css";

type TabKey = "about" | "resumes";

type PublicSeekerPhoto = {
  id: number;
  url: string;
  fileName?: string;
  filename?: string;
};

type PublicResumeFile = {
  id: number;
  fileName?: string;
  mimeType?: string;
  storagePath?: string;
  sizeBytes?: number;
  uploadedAt?: string;
  url?: string | null;
} | null;

type PublicResume = {
  id: number;
  title?: string | null;
  desiredPosition?: string | null;
  salaryExpectation?: number | null;
  experienceLevel?: string | null;
  skills?: string[];
  isPublic?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  resumeFile?: PublicResumeFile;
};

type PublicSeekerProfile = {
  id: number;
  userId?: number;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  summary?: string | null;
  location?: string | null;
  phone?: string | null;
  experienceLevel?: string | null;
  user?: {
    id?: number;
    email?: string;
  };
  photos?: PublicSeekerPhoto[];
  resumes?: PublicResume[];
};

function getFullName(profile: PublicSeekerProfile | null) {
  if (!profile) return "Соискатель";

  if (profile.fullName?.trim()) return profile.fullName.trim();

  const joined = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return joined || "Соискатель";
}

function formatMoney(value?: number | null) {
  if (value == null) return "Не указано";
  return `${value.toLocaleString("ru-RU")} сом`;
}

export default function PublicSeekerProfilePage() {
  const { seekerProfileId } = useParams();
  const navigate = useNavigate();
  const { me } = useAuth();

  const [tab, setTab] = useState<TabKey>("about");
  const [profile, setProfile] = useState<PublicSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!seekerProfileId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await publicSeekersApi.getById(seekerProfileId);
        setProfile(response.profile ?? null);
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить профиль соискателя");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [seekerProfileId]);

  const fullName = useMemo(() => getFullName(profile), [profile]);
  const avatarLetter = fullName?.[0]?.toUpperCase() || "S";

  const isMyProfile =
    me?.role === "USER" &&
    profile?.userId != null &&
    Number(me.id) === Number(profile.userId);

  const photos = profile?.photos ?? [];
  const resumes = profile?.resumes ?? [];

  if (loading) {
    return <div className="surface card-pad">Загрузка профиля соискателя...</div>;
  }

  if (error) {
    return <div className="surface card-pad editor-alert">{error}</div>;
  }

  if (!profile) {
    return <div className="surface card-pad">Профиль соискателя не найден.</div>;
  }

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
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>{avatarLetter}</span>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 900 }}>
              {fullName}
            </div>

            <div style={{ fontSize: 18, color: "#374151" }}>
              {profile.headline?.trim() || "Краткое описание не указано"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            variant={tab === "about" ? "primary" : "default"}
            onClick={() => setTab("about")}
          >
            О соискателе
          </Button>

          <Button
            variant={tab === "resumes" ? "primary" : "default"}
            onClick={() => setTab("resumes")}
          >
            Резюме
          </Button>

          {isMyProfile && (
            <Button onClick={() => navigate("/seeker/profile")}>
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {tab === "about" && (
        <>
          <div className="surface card-pad">
            <h2>О соискателе</h2>
            <div style={{ marginTop: 12, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {profile.summary?.trim() || "Описание не заполнено"}
            </div>
          </div>

          <div className="surface card-pad">
            <h2>Контакты</h2>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Город
                </div>
                <div style={{ marginTop: 6 }}>{profile.location || "-"}</div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Телефон
                </div>
                <div style={{ marginTop: 6 }}>{profile.phone || "-"}</div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Email
                </div>
                <div style={{ marginTop: 6 }}>{profile.user?.email || "-"}</div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Уровень опыта
                </div>
                <div style={{ marginTop: 6 }}>{profile.experienceLevel || "-"}</div>
              </div>
            </div>
          </div>

          <div className="surface card-pad">
            <h2>Фотографии</h2>

            {photos.length === 0 ? (
              <div style={{ marginTop: 12, color: "#6b7280" }}>
                У соискателя пока нет фотографий.
              </div>
            ) : (
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt={photo.fileName || photo.filename || "Фото соискателя"}
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 16,
                      cursor: "pointer",
                      border: "1px solid var(--border)",
                    }}
                    onClick={() => setSelectedImage(photo.url)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "resumes" && (
        <div className="surface card-pad">
          <h2>Публичные резюме</h2>

          {resumes.length === 0 ? (
            <div style={{ marginTop: 12, color: "#6b7280" }}>
              У этого соискателя пока нет публичных резюме.
            </div>
          ) : (
            <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 18,
                    padding: 16,
                    display: "grid",
                    gap: 10,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800 }}>
                        {resume.title?.trim() || "Без названия"}
                      </div>

                      <div style={{ marginTop: 6, color: "#475569" }}>
                        {resume.desiredPosition?.trim() || "Желаемая должность не указана"}
                      </div>
                    </div>

                    <Link
                      to={`/resumes/${resume.id}`}
                      style={{
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      Открыть резюме
                    </Link>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                        Зарплата
                      </div>
                      <div style={{ marginTop: 6 }}>
                        {formatMoney(resume.salaryExpectation)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                        Опыт
                      </div>
                      <div style={{ marginTop: 6 }}>
                        {resume.experienceLevel || "-"}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                        Статус
                      </div>
                      <div style={{ marginTop: 6 }}>
                        {resume.status || "-"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                      Навыки
                    </div>
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(resume.skills ?? []).length > 0 ? (
                        (resume.skills ?? []).map((skill, index) => (
                          <span
                            key={`${resume.id}-${skill}-${index}`}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              border: "1px solid var(--border)",
                              background: "#f8fafc",
                              fontSize: 14,
                            }}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "#6b7280" }}>Навыки не указаны</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <img
            src={selectedImage}
            alt="Просмотр фото"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: 18,
              display: "block",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}