import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobsApi } from "../../api/endpoints";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { useAuth } from "../../auth/AuthProvider";
import "../../components/ui.css";

type FormState = {
  title: string;
  description: string;
  city: string;
  category: string;
  salaryFrom: string;
  salaryTo: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  requiredSkills: string;
};

const initialState: FormState = {
  title: "",
  description: "",
  city: "",
  category: "",
  salaryFrom: "",
  salaryTo: "",
  employmentType: "FULL_TIME",
  workMode: "ONSITE",
  experienceLevel: "JUNIOR",
  requiredSkills: "",
};

const categories = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Design",
  "QA",
  "DevOps",
  "Mobile",
  "Sales",
  "Marketing",
];

export default function CompanyJobEditorPage() {
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);
  const nav = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit || !jobId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await jobsApi.getMyCompanyJob(token!, jobId);

        setForm({
          title: res.job.title ?? "",
          description: res.job.description ?? "",
          city: res.job.city ?? "",
          category: res.job.category ?? "",
          salaryFrom: res.job.salaryFrom ? String(res.job.salaryFrom) : "",
          salaryTo: res.job.salaryTo ? String(res.job.salaryTo) : "",
          employmentType: res.job.employmentType ?? "FULL_TIME",
          workMode: res.job.workMode ?? "ONSITE",
          experienceLevel: res.job.experienceLevel ?? "JUNIOR",
          requiredSkills: Array.isArray(res.job.requiredSkills)
            ? res.job.requiredSkills.join(", ")
            : "",
        });
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить вакансию");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, jobId]);

  const skillsPreview = useMemo(
    () =>
      form.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8),
    [form.requiredSkills]
  );

  const onChange =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Войдите в аккаунт компании");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        category: form.category.trim(),
        salaryFrom: form.salaryFrom ? Number(form.salaryFrom) : undefined,
        salaryTo: form.salaryTo ? Number(form.salaryTo) : undefined,
        employmentType: form.employmentType,
        workMode: form.workMode,
        experienceLevel: form.experienceLevel,
        requiredSkills: form.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (isEdit && jobId) {
        await jobsApi.updateJob(token!, jobId, payload);
      } else {
        await jobsApi.createJob(token!, payload);
      }

      nav("/company/jobs");
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить вакансию");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editor-page">
        <div className="surface card-pad">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <form className="editor-full" onSubmit={onSubmit}>
        <div className="surface card-pad editor-section">
          <h1 className="h1">
            {isEdit ? "Редактирование вакансии" : "Создание вакансии"}
          </h1>

          {error && (
            <div className="editor-alert" style={{ marginTop: 12 }}>
              {error}
            </div>
          )}
        </div>

        {/* ОСНОВНОЕ */}
        <section className="surface card-pad editor-section">
          <h2 className="editor-section-title">Основная информация</h2>

          <div className="editor-fields">
            <div>
              <label className="label">Название вакансии</label>
              <Input
                placeholder="Frontend Developer"
                value={form.title}
                onChange={onChange("title")}
              />
            </div>

            <div className="editor-two">
              <div>
                <label className="label">Город</label>
                <Input
                  placeholder="Bishkek"
                  value={form.city}
                  onChange={onChange("city")}
                />
              </div>

              <div>
                <label className="label">Категория</label>
                <Select value={form.category} onChange={onChange("category")}>
                  <option value="">Выбери</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="label">Описание</label>
              <textarea
                className="editor-textarea"
                placeholder="Опишите вакансию..."
                value={form.description}
                onChange={onChange("description")}
              />
            </div>
          </div>
        </section>

        {/* УСЛОВИЯ */}
        <section className="surface card-pad editor-section">
          <h2 className="editor-section-title">Условия</h2>

          <div className="editor-fields">
            <div className="editor-three">
              <div>
                <label className="label">Занятость</label>
                <Select
                  value={form.employmentType}
                  onChange={onChange("employmentType")}
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                </Select>
              </div>

              <div>
                <label className="label">Формат</label>
                <Select value={form.workMode} onChange={onChange("workMode")}>
                  <option value="ONSITE">On-site</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </Select>
              </div>

              <div>
                <label className="label">Опыт</label>
                <Select
                  value={form.experienceLevel}
                  onChange={onChange("experienceLevel")}
                >
                  <option value="JUNIOR">Junior</option>
                  <option value="MIDDLE">Middle</option>
                  <option value="SENIOR">Senior</option>
                </Select>
              </div>
            </div>

            <div className="editor-two">
              <div>
                <label className="label">ЗП от</label>
                <Input
                  type="number"
                  min={0}
                  step={50}
                  value={form.salaryFrom}
                  onChange={onChange("salaryFrom")}
                />
              </div>

              <div>
                <label className="label">ЗП до</label>
                <Input
                  type="number"
                  min={0}
                  step={50}
                  value={form.salaryTo}
                  onChange={onChange("salaryTo")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* НАВЫКИ */}
        <section className="surface card-pad editor-section">
          <h2 className="editor-section-title">Навыки</h2>

          <Input
            placeholder="React, TypeScript"
            value={form.requiredSkills}
            onChange={onChange("requiredSkills")}
          />
        </section>

        {/* КНОПКИ */}
        <div className="surface card-pad editor-submit-row">
          <Button onClick={() => nav("/company/jobs")}>Отмена</Button>

          <Button variant="primary" type="submit" disabled={saving}>
            {saving
              ? "Сохранение..."
              : isEdit
              ? "Сохранить"
              : "Создать"}
          </Button>
        </div>
      </form>
    </div>
);
}