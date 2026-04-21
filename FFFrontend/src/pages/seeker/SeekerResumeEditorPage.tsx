import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Input } from "../../components/Input";
import { Textarea } from "../../components/Textarea";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";

type ResumeDto = {
  id: number;
  title: string;
  desiredPosition?: string | null;
  salaryExpectation?: number | null;
  experienceLevel?: string | null;
  skills?: string[];
  isPublic?: boolean;
  status?: string;
  resumeFile?: {
    id: number;
    fileName: string;
    url?: string;
  } | null;
};

type FormState = {
  title: string;
  desiredPosition: string;
  salaryExpectation: string;
  experienceLevel: string;
  skillsText: string;
};

const emptyForm: FormState = {
  title: "",
  desiredPosition: "",
  salaryExpectation: "",
  experienceLevel: "",
  skillsText: "",
};

function resumeToForm(resume: ResumeDto): FormState {
  return {
    title: resume.title ?? "",
    desiredPosition: resume.desiredPosition ?? "",
    salaryExpectation:
      typeof resume.salaryExpectation === "number"
        ? String(resume.salaryExpectation)
        : "",
    experienceLevel: resume.experienceLevel ?? "",
    skillsText: (resume.skills ?? []).join(", "),
  };
}

export default function SeekerResumeEditorPage() {
  const { resumeId } = useParams();
  const isEdit = Boolean(resumeId);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isEdit || !resumeId || !token) return;

    const loadResume = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch<ResumeDto>(`/seeker/resumes/${resumeId}`, {
          method: "GET",
          token,
        });

        setResume(data);
        setForm(resumeToForm(data));
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить резюме");
      } finally {
        setLoading(false);
      }
    };

    void loadResume();
  }, [isEdit, resumeId, token]);

  const statusText = useMemo(() => {
    const status = resume?.status;
    if (status === "PENDING") return "На модерации";
    if (status === "APPROVED") return "Одобрено";
    if (status === "REJECTED") return "Отклонено";
    return "";
  }, [resume?.status]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const parseSkills = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const saveResume = async () => {
    if (!token) return;

    if (!form.title.trim()) {
      setError("Название резюме обязательно");
      return;
    }

    if (!isEdit && !cvFile) {
      setError("Нужно прикрепить PDF файл резюме");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: form.title.trim(),
        desiredPosition: form.desiredPosition.trim() || null,
        salaryExpectation: form.salaryExpectation.trim()
          ? Number(form.salaryExpectation)
          : null,
        experienceLevel: form.experienceLevel || null,
        skills: parseSkills(form.skillsText),
      };

      let response: any;

      if (isEdit && resumeId) {
        response = await apiFetch<any>(`/seeker/resumes/${resumeId}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(payload),
        });
      } else {
        response = await apiFetch<any>("/seeker/resumes", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });
      }

// 🔥 НОРМАЛИЗАЦИЯ ОТВЕТА
const savedResume: ResumeDto =
  response?.resume ??
  response?.data ??
  response;

if (!savedResume?.id) {
  throw new Error("Ошибка: не удалось получить id резюме");
}

setResume(savedResume);

      setResume(savedResume);

      if (cvFile) {
        try {
          setUploadingFile(true);

          const formData = new FormData();
          formData.append("file", cvFile);

          await apiFetch(`/seeker/resumes/${savedResume.id}/file`, {
            method: "POST",
            token,
            body: formData,
          });
        } finally {
          setUploadingFile(false);
        }
      }

      setSuccess("Резюме сохранено и отправлено на модерацию");
      navigate("/seeker/resumes");
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить резюме");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="surface card-pad">Загрузка резюме...</div>;
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="surface card-pad">
        <h1 className="h1">{isEdit ? "Редактирование резюме" : "Создание резюме"}</h1>
        {statusText ? (
          <div style={{ marginTop: 10, color: "#475569", fontWeight: 700 }}>
            Статус: {statusText}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="surface card-pad">
          <p style={{ color: "crimson" }}>{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="surface card-pad">
          <p style={{ color: "green" }}>{success}</p>
        </div>
      ) : null}

      <div className="surface card-pad" style={{ display: "grid", gap: 14 }}>
        <Input
          placeholder="Название резюме"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
        />

        <Input
          placeholder="Желаемая должность"
          value={form.desiredPosition}
          onChange={(e) => setField("desiredPosition", e.target.value)}
        />

        <Input
          type="number"
          min={0}
          step={50}
          placeholder="Ожидаемая зарплата"
          value={form.salaryExpectation}
          onChange={(e) => setField("salaryExpectation", e.target.value)}
        />

        <Select
          value={form.experienceLevel}
          onChange={(e) => setField("experienceLevel", e.target.value)}
        >
          <option value="">Опыт не указан</option>
          <option value="INTERN">Intern</option>
          <option value="JUNIOR">Junior</option>
          <option value="MIDDLE">Middle</option>
          <option value="SENIOR">Senior</option>
          <option value="LEAD">Lead</option>
        </Select>

        <Textarea
          placeholder="Навыки через запятую, например: React, TypeScript, Vite"
          value={form.skillsText}
          onChange={(e) => setField("skillsText", e.target.value)}
        />

        <div style={{ display: "grid", gap: 8 }}>
          <label className="label">PDF файл резюме</label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setCvFile(file);
            }}
          />
          {cvFile ? (
            <div style={{ color: "#475569" }}>Выбран файл: {cvFile.name}</div>
          ) : resume?.resumeFile?.fileName ? (
            <div style={{ color: "#475569" }}>
              Текущий файл: {resume.resumeFile.fileName}
            </div>
          ) : (
            <div style={{ color: "#64748b" }}>
              Прикрепи PDF файл. Для нового резюме файл обязателен.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button
            variant="primary"
            onClick={saveResume}
            disabled={saving || uploadingFile}
          >
            {saving || uploadingFile ? "Сохранение..." : "Сохранить"}
          </Button>

          <Button onClick={() => navigate("/seeker/resumes")}>
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
}