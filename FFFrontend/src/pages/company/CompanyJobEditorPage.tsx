import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { jobsApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Input } from "../../components/Input";
import { Textarea } from "../../components/Textarea";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { useNavigate, useParams } from "react-router-dom";
import "../../components/ui.css";

type Props = { mode: "create" | "edit" };

const empty = {
  title: "",
  description: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  employmentType: "full",
  workMode: "remote",
  experienceLevel: "middle",
  requiredSkillsText: "react, typescript"
};

export function CompanyJobEditorPage({ mode }: Props) {
  const { token } = useAuth();
  const nav = useNavigate();
  const { jobId } = useParams();
  const [m, setM] = useState({ ...empty });
  const [msg, setMsg] = useState<string | null>(null);

  // For edit mode we try to fetch through company list and find job
  const companyJobs = useQuery({
    queryKey: ["companyJobs"],
    queryFn: () => jobsApi.listCompany(token!),
    enabled: !!token
  });

  useEffect(() => {
    if (mode === "edit" && companyJobs.data && jobId) {
      const j = companyJobs.data.data.find((x) => x.id === jobId);
      if (j) {
        setM({
          title: j.title ?? "",
          description: j.description ?? "",
          location: j.location ?? "",
          salaryMin: j.salaryMin ? String(j.salaryMin) : "",
          salaryMax: j.salaryMax ? String(j.salaryMax) : "",
          employmentType: (j.employmentType as any) ?? "full",
          workMode: (j.workMode as any) ?? "remote",
          experienceLevel: (j.experienceLevel as any) ?? "middle",
          requiredSkillsText: (j.requiredSkills ?? []).join(", ")
        });
      }
    }
  }, [mode, companyJobs.data, jobId]);

  const mut = useMutation({
    mutationFn: async () => {
      const body = {
        title: m.title.trim(),
        description: m.description.trim(),
        location: m.location.trim(),
        salaryMin: m.salaryMin ? Number(m.salaryMin) : null,
        salaryMax: m.salaryMax ? Number(m.salaryMax) : null,
        employmentType: m.employmentType,
        workMode: m.workMode,
        experienceLevel: m.experienceLevel,
        requiredSkills: m.requiredSkillsText.split(",").map(s => s.trim()).filter(Boolean),
        categoryId: null,
        tagIds: []
      };
      if (mode === "create") return jobsApi.createCompany(token!, body);
      return jobsApi.updateCompany(token!, jobId!, body);
    },
    onSuccess: (d: any) => {
      setMsg("Сохранено. Статус может быть PENDING до модерации.");
      nav("/company/jobs");
    },
    onError: (e: any) => setMsg(e?.message ?? "Не удалось сохранить.")
  });

  if (mode === "edit" && companyJobs.isLoading) return <Centered><Spinner /></Centered>;
  if (mode === "edit" && companyJobs.isError) return <Centered title="Ошибка">{(companyJobs.error as any)?.message ?? "Не удалось загрузить данные."}</Centered>;

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">{mode === "create" ? "Создать вакансию" : "Редактировать вакансию"}</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Поля соответствуют ТЗ (title, description, location, salary range, type, mode, skills, experience).
            </p>
          </div>
          <div className="toolbar">
            <Button onClick={() => nav("/company/jobs")}>Назад</Button>
            <Button variant="primary" disabled={mut.isPending} onClick={() => mut.mutate()}>
              {mut.isPending ? "Сохранение…" : "Сохранить"}
            </Button>
          </div>
        </div>

        <div className="hr" style={{ margin: "14px 0" }} />

        <div className="grid grid-2">
          <div>
            <label className="label">Название</label>
            <Input value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Локация</label>
            <Input value={m.location} onChange={(e) => setM({ ...m, location: e.target.value })} />
          </div>

          <div className="grid grid-2" style={{ gridColumn: "1 / -1" }}>
            <div>
              <label className="label">Зарплата min</label>
              <Input inputMode="numeric" value={m.salaryMin} onChange={(e) => setM({ ...m, salaryMin: e.target.value.replace(/\D/g,"") })} />
            </div>
            <div>
              <label className="label">Зарплата max</label>
              <Input inputMode="numeric" value={m.salaryMax} onChange={(e) => setM({ ...m, salaryMax: e.target.value.replace(/\D/g,"") })} />
            </div>
          </div>

          <div>
            <label className="label">Формат работы</label>
            <Select value={m.workMode} onChange={(e) => setM({ ...m, workMode: e.target.value })}>
              <option value="remote">remote</option>
              <option value="onsite">onsite</option>
              <option value="hybrid">hybrid</option>
            </Select>
          </div>

          <div>
            <label className="label">Занятость</label>
            <Select value={m.employmentType} onChange={(e) => setM({ ...m, employmentType: e.target.value })}>
              <option value="full">full</option>
              <option value="part">part</option>
            </Select>
          </div>

          <div>
            <label className="label">Уровень</label>
            <Select value={m.experienceLevel} onChange={(e) => setM({ ...m, experienceLevel: e.target.value })}>
              <option value="intern">intern</option>
              <option value="junior">junior</option>
              <option value="middle">middle</option>
              <option value="senior">senior</option>
              <option value="lead">lead</option>
            </Select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Навыки (requiredSkills через запятую)</label>
            <Input value={m.requiredSkillsText} onChange={(e) => setM({ ...m, requiredSkillsText: e.target.value })} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Описание</label>
            <Textarea value={m.description} onChange={(e) => setM({ ...m, description: e.target.value })} />
          </div>
        </div>

        {msg && <div className="small" style={{ marginTop: 10, fontWeight: 800 }}>{msg}</div>}
      </div>
    </div>
  );
}
