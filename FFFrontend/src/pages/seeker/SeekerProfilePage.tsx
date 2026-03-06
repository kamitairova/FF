import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { seekerApi } from "../../api/endpoints";
import { ExperienceLevel, SeekerProfile } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { Input } from "../../components/Input";
import { Textarea } from "../../components/Textarea";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import "../../components/ui.css";

const empty: SeekerProfile = {
  fullName: "",
  location: "",
  headline: "",
  summary: "",
  skills: [],
  experienceLevel: ""
};

export function SeekerProfilePage() {
  const { token } = useAuth();
  const q = useQuery({
    queryKey: ["seekerProfile"],
    queryFn: () => seekerApi.getProfile(token!),
    enabled: !!token
  });

  const [model, setModel] = useState<SeekerProfile>(empty);
  const [skillsText, setSkillsText] = useState("");

  useEffect(() => {
    if (q.data) {
      setModel({ ...empty, ...q.data, skills: q.data.skills ?? [] });
      setSkillsText((q.data.skills ?? []).join(", "));
    }
  }, [q.data]);

  const mut = useMutation({
    mutationFn: async () => {
      const next: SeekerProfile = {
        ...model,
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      };
      return seekerApi.putProfile(token!, next);
    },
    onSuccess: (d) => {
      setModel({ ...empty, ...d, skills: d.skills ?? [] });
      setSkillsText((d.skills ?? []).join(", "));
    }
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить профиль."}</Centered>;

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">Профиль соискателя</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Эти поля используются для поиска кандидатов компаниями и для отображения в профиле.
            </p>
          </div>
          <div>
            <Button variant="primary" disabled={mut.isPending} onClick={() => mut.mutate()}>
              {mut.isPending ? "Сохранение…" : "Сохранить"}
            </Button>
          </div>
        </div>

        <div className="hr" style={{ margin: "14px 0" }} />

        <div className="grid grid-2">
          <div>
            <label className="label">ФИО</label>
            <Input value={model.fullName} onChange={(e) => setModel({ ...model, fullName: e.target.value })} />
          </div>
          <div>
            <label className="label">Локация</label>
            <Input value={model.location} onChange={(e) => setModel({ ...model, location: e.target.value })} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Заголовок (headline)</label>
            <Input value={model.headline} onChange={(e) => setModel({ ...model, headline: e.target.value })} placeholder="Например: Frontend Developer (React)" />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">О себе</label>
            <Textarea value={model.summary} onChange={(e) => setModel({ ...model, summary: e.target.value })} />
          </div>

          <div>
            <label className="label">Уровень</label>
            <Select value={model.experienceLevel} onChange={(e) => setModel({ ...model, experienceLevel: e.target.value as ExperienceLevel | "" })}>
              <option value="">Не выбран</option>
              <option value="intern">Intern</option>
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </Select>
          </div>

          <div>
            <label className="label">Навыки (через запятую)</label>
            <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="react, typescript, css, ..." />
          </div>
        </div>

        {mut.isSuccess && <div className="small" style={{ marginTop: 10, fontWeight: 800 }}>Сохранено.</div>}
      </div>
    </div>
  );
}
