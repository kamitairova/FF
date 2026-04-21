import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Textarea } from "../../components/Textarea";
import { useAuth } from "../../auth/AuthProvider";
import { apiFetch } from "../../api/client";
import "../../components/ui.css";

type TabKey = "edit" | "about" | "resumes";

type SeekerProfileDto = {
  id?: number;
  userId?: number;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  summary?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  experienceLevel?: string | null;
};

type SeekerPhotoDto = {
  id: number;
  url: string;
  fileName?: string;
  filename?: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  phone: string;
  experienceLevel: string;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  headline: "",
  summary: "",
  location: "",
  phone: "",
  experienceLevel: "",
};

function getApiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  return base.replace(/\/api\/?$/, "");
}

function buildImageUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getApiOrigin()}${url}`;
}

function getFullName(profile: SeekerProfileDto | null) {
  if (!profile) return "Имя не указано";

  if (profile.fullName?.trim()) return profile.fullName.trim();

  const joined = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return joined || "Имя не указано";
}

function normalizeProfile(data: any, authEmail?: string | null): SeekerProfileDto {
  const profile = data?.profile ?? data ?? {};

  return {
    id: profile.id,
    userId: profile.userId,
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    fullName: profile.fullName ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    headline: profile.headline ?? "",
    summary: profile.summary ?? "",
    location: profile.location ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? profile.user?.email ?? authEmail ?? "",
    experienceLevel: profile.experienceLevel ?? "",
  };
}

function profileToForm(profile: SeekerProfileDto): FormState {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    headline: profile.headline ?? "",
    summary: profile.summary ?? "",
    location: profile.location ?? "",
    phone: profile.phone ?? "",
    experienceLevel: profile.experienceLevel ?? "",
  };
}

export function SeekerProfilePage() {
  const { token, me } = useAuth();

  const [tab, setTab] = useState<TabKey>("about");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosUploading, setPhotosUploading] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState<SeekerProfileDto | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [photos, setPhotos] = useState<SeekerPhotoDto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);

  const fullName = useMemo(() => getFullName(profile), [profile]);
  const avatarLetter = fullName?.[0]?.toUpperCase() || "S";
  const avatarUrl = buildImageUrl(profile?.avatarUrl);
  const shortDescription = profile?.headline?.trim() || "Краткое описание соискателя";

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return JSON.stringify(form) !== JSON.stringify(profileToForm(profile));
  }, [form, profile]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const data = await apiFetch<any>("/seeker/profile", {
        method: "GET",
        token,
      });

      const normalized = normalizeProfile(data, me?.email ?? "");
      setProfile(normalized);
      setForm(profileToForm(normalized));
    } catch (e: any) {
      setError(e?.message || "Не удалось загрузить профиль соискателя");
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    if (!token) return;

    try {
      setPhotosLoading(true);

      const data = await apiFetch<any>("/seeker/profile/photos", {
        method: "GET",
        token,
      });

      setPhotos(data?.photos ?? data ?? []);
    } catch (e) {
      console.error("Failed to load seeker photos", e);
    } finally {
      setPhotosLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    void loadPhotos();
  }, [token]);

  const handleSaveProfile = async () => {
    if (!token) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        headline: form.headline.trim(),
        summary: form.summary.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        experienceLevel: form.experienceLevel.trim() || null,
      };

      const updated = await apiFetch<any>("/seeker/profile", {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
      });

      const normalized = normalizeProfile(updated, me?.email ?? "");
      setProfile(normalized);
      setForm(profileToForm(normalized));
      setSuccess("Изменения сохранены");
      setTab("about");
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить профиль");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!profile) return;
    setForm(profileToForm(profile));
    setSelectedAvatar(null);
    setError("");
    setSuccess("");
  };

  const handleUploadAvatar = async () => {
    if (!token || !selectedAvatar) return;

    try {
      setAvatarUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("avatar", selectedAvatar);

      const updated = await apiFetch<any>("/seeker/profile/avatar", {
        method: "POST",
        token,
        body: formData,
      });

      const normalized = normalizeProfile(updated, me?.email ?? "");
      setProfile((prev) => ({
        ...prev,
        ...normalized,
      }));
      setSelectedAvatar(null);
      setSuccess("Аватар обновлён");
    } catch (e: any) {
      setError(e?.message || "Не удалось загрузить аватар");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!token) return;

    try {
      setAvatarDeleting(true);
      setError("");
      setSuccess("");

      const updated = await apiFetch<any>("/seeker/profile/avatar", {
        method: "DELETE",
        token,
      });

      const normalized = normalizeProfile(updated, me?.email ?? "");
      setProfile((prev) => ({
        ...prev,
        ...normalized,
      }));
      setSelectedAvatar(null);
      setSuccess("Аватар удалён");
    } catch (e: any) {
      setError(e?.message || "Не удалось удалить аватар");
    } finally {
      setAvatarDeleting(false);
    }
  };

  const handleUploadPhotos = async () => {
    if (!token || selectedPhotos.length === 0) return;

    try {
      setPhotosUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      for (const file of selectedPhotos) {
        formData.append("photos", file);
      }

      const data = await apiFetch<any>("/seeker/profile/photos", {
        method: "POST",
        token,
        body: formData,
      });

      const uploadedPhotos = data?.photos ?? [];
      setPhotos((prev) => [...prev, ...uploadedPhotos]);
      setSelectedPhotos([]);
      setSuccess("Фотографии загружены");
    } catch (e: any) {
      setError(e?.message || "Не удалось загрузить фотографии");
    } finally {
      setPhotosUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!token) return;

    try {
      setError("");
      setSuccess("");

      await apiFetch(`/seeker/profile/photos/${photoId}`, {
        method: "DELETE",
        token,
      });

      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
      setSuccess("Фотография удалена");
    } catch (e: any) {
      setError(e?.message || "Не удалось удалить фотографию");
    }
  };

  if (loading) {
    return <div className="surface card-pad">Загрузка профиля...</div>;
  }

  return (
    <div className="editor-page">
      <div className="surface card-pad" style={{ display: "grid", gap: 18 }}>
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
              borderRadius: 999,
              border: "3px solid #111827",
              overflow: "hidden",
              background: "#f8fafc",
              display: "grid",
              placeItems: "center",
              fontSize: 52,
              fontWeight: 900,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Аватар соискателя"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <span>{avatarLetter}</span>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                fontSize: 36,
                lineHeight: 1.05,
                fontWeight: 900,
              }}
            >
              {fullName}
            </div>

            <div
              style={{
                fontSize: 17,
                color: "#111827",
                minHeight: 34,
              }}
            >
              {shortDescription}
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
            О соискателе
          </Button>

          <Button
            variant={tab === "resumes" ? "primary" : "default"}
            onClick={() => setTab("resumes")}
          >
            Мои резюме
          </Button>
        </div>
      </div>

      {error ? (
        <div
          className="surface card-pad"
          style={{
            color: "#991b1b",
            border: "1px solid #fecaca",
            background: "#fef2f2",
          }}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          className="surface card-pad"
          style={{
            color: "#166534",
            border: "1px solid #bbf7d0",
            background: "#f0fdf4",
          }}
        >
          {success}
        </div>
      ) : null}

      {tab === "about" && (
        <>
          <div className="surface card-pad">
            <h2 className="editor-section-title">О соискателе</h2>
            <div style={{ marginTop: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {profile?.summary?.trim() || "Описание пока не заполнено."}
            </div>
          </div>

          <div className="surface card-pad">
            <h2 className="editor-section-title">Контакты</h2>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Город
                </div>
                <div style={{ marginTop: 6 }}>{profile?.location || "Не указан"}</div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Телефон
                </div>
                <div style={{ marginTop: 6 }}>{profile?.phone || "Не указан"}</div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Email
                </div>
                <div style={{ marginTop: 6 }}>{profile?.email || me?.email || "Не указан"}</div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>
                  Уровень опыта
                </div>
                <div style={{ marginTop: 6 }}>
                  {profile?.experienceLevel || "Не указан"}
                </div>
              </div>
            </div>
          </div>

          <div className="surface card-pad">
            <h2 className="editor-section-title">Фотографии</h2>

            {photosLoading ? (
              <div style={{ marginTop: 12, color: "#6b7280" }}>Загрузка фотографий...</div>
            ) : photos.length === 0 ? (
              <div style={{ marginTop: 12, color: "#6b7280" }}>
                Фотографии пока не добавлены.
              </div>
            ) : (
              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      minHeight: 220,
                      borderRadius: 18,
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "#f8fafc",
                    }}
                  >
                    <img
                      src={buildImageUrl(photo.url)}
                      alt={photo.fileName || photo.filename || "Фото соискателя"}
                      style={{
                        width: "100%",
                        height: 220,
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

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 16,
                display: "grid",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>Аватар</h3>

              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 999,
                    overflow: "hidden",
                    border: "2px solid #111827",
                    background: "#f8fafc",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 28,
                    fontWeight: 800,
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Текущий аватар"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span>{avatarLetter}</span>
                  )}
                </div>

                <div style={{ display: "grid", gap: 10, minWidth: 260 }}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setSelectedAvatar(file);
                    }}
                  />

                  {selectedAvatar ? (
                    <div style={{ color: "#475569" }}>
                      Выбран файл: {selectedAvatar.name}
                    </div>
                  ) : (
                    <div style={{ color: "#64748b" }}>
                      Выбери изображение для новой аватарки.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Button
                      variant="primary"
                      onClick={handleUploadAvatar}
                      disabled={!selectedAvatar || avatarUploading}
                    >
                      {avatarUploading ? "Загрузка..." : "Загрузить аватар"}
                    </Button>

                    <Button
                      onClick={handleDeleteAvatar}
                      disabled={!profile?.avatarUrl || avatarDeleting || avatarUploading}
                    >
                      {avatarDeleting ? "Удаление..." : "Удалить аватар"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="editor-two">
              <Input
                placeholder="Имя"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
              />
              <Input
                placeholder="Фамилия"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
              />
            </div>

            <Input
              placeholder="Короткое описание"
              value={form.headline}
              onChange={(e) => setField("headline", e.target.value)}
            />

            <Textarea
              placeholder="Полное описание соискателя"
              value={form.summary}
              onChange={(e) => setField("summary", e.target.value)}
            />

            <div className="editor-two">
              <Input
                placeholder="Город"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
              />
              <Input
                placeholder="Телефон"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>

            <Input
              placeholder="Уровень опыта"
              value={form.experienceLevel}
              onChange={(e) => setField("experienceLevel", e.target.value)}
            />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={saving || !hasChanges}
              >
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </Button>

              <Button onClick={handleReset} disabled={saving}>
                Сбросить
              </Button>
            </div>
          </div>

          <div className="surface card-pad" style={{ display: "grid", gap: 16 }}>
            <h2 className="editor-section-title">Фото соискателя</h2>

            <div
              style={{
                border: "1px dashed var(--border)",
                borderRadius: 16,
                padding: 16,
                display: "grid",
                gap: 12,
              }}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedPhotos(files);
                }}
              />

              {selectedPhotos.length > 0 ? (
                <div style={{ color: "#475569" }}>
                  Выбрано файлов: {selectedPhotos.length}
                </div>
              ) : (
                <div style={{ color: "#64748b" }}>
                  Можно выбрать несколько файлов сразу.
                </div>
              )}

              <div>
                <Button
                  variant="primary"
                  onClick={handleUploadPhotos}
                  disabled={photosUploading || selectedPhotos.length === 0}
                >
                  {photosUploading ? "Загрузка..." : "Добавить фото"}
                </Button>
              </div>
            </div>

            {photos.length === 0 ? (
              <div style={{ color: "#6b7280" }}>Пока нет загруженных фотографий.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 1fr auto",
                      gap: 14,
                      alignItems: "center",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <img
                      src={buildImageUrl(photo.url)}
                      alt={photo.fileName || photo.filename || "Фото соискателя"}
                      style={{
                        width: 110,
                        height: 90,
                        borderRadius: 12,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    <div style={{ color: "#475569" }}>
                      {photo.fileName || photo.filename || `Фото #${photo.id}`}
                    </div>

                    <Button onClick={() => handleDeletePhoto(photo.id)}>
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "resumes" && (
        <div className="surface card-pad">
          <h2 className="editor-section-title">Мои резюме</h2>
          <div style={{ marginTop: 12, color: "#6b7280" }}>
            Здесь остаётся твоя текущая логика списка резюме или ссылка на страницу резюме.
          </div>
        </div>
      )}
    </div>
  );
}