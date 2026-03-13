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
  experienceLevel: "",
};

const levelMap: Record<string, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MIDDLE: "Middle",
  SENIOR: "Senior",
  LEAD: "Lead",
};

export function SeekerProfilePage() {
  const { token, me } = useAuth();
  const q = useQuery({
    queryKey: ["seekerProfile"],
    queryFn: () => seekerApi.getProfile(token!),
    enabled: !!token,
  });

  const [model, setModel] = useState<SeekerProfile>(empty);
  const [skillsText, setSkillsText] = useState("");

  useEffect(() => {
    if (q.data) {
      setModel({ ...empty, ...q.data, skills: q.data.skills ?? [] });
      setSkillsText((q.data.skills ?? []).join(", "));
    }
  }, [q.data]);

  const skillList = useMemo(
    () => skillsText.split(",").map((item) => item.trim()).filter(Boolean),
    [skillsText]
  );

  const mut = useMutation({
    mutationFn: async () => {
      const next: SeekerProfile = {
        ...model,
        skills: skillList,
      };
      return seekerApi.putProfile(token!, next);
    },
    onSuccess: (d) => {
      setModel({ ...empty, ...d, skills: d.skills ?? [] });
      setSkillsText((d.skills ?? []).join(", "));
    },
  });

  if (q.isLoading) {
    return (
      <Centered>
        <Spinner />
      </Centered>
    );
  }

  if (q.isError) {
    return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить профиль."}</Centered>;
  }

  return (
    <div className="profile-layout">
      <div className="profile-main surface card-pad">
        <div className="split profile-header">
          <div>
            <span className="eyebrow">Профиль пользователя</span>
            <h1 className="h1">Заполните профиль соискателя</h1>
            <p className="p profile-copy">
              Этот блок помогает компаниям быстрее находить вас по навыкам, уровню и описанию.
            </p>
          </div>

          <Button variant="primary" disabled={mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? "Сохранение…" : "Сохранить профиль"}
          </Button>
        </div>

        <div className="hr profile-divider" />

        <div className="grid grid-2">
          <div>
            <label className="label">ФИО</label>
            <Input value={model.fullName} onChange={(e) => setModel({ ...model, fullName: e.target.value })} placeholder="Имя и фамилия" />
          </div>

          <div>
            <label className="label">Локация</label>
            <Input value={model.location} onChange={(e) => setModel({ ...model, location: e.target.value })} placeholder="Например: Бишкек" />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Заголовок</label>
            <Input
              value={model.headline}
              onChange={(e) => setModel({ ...model, headline: e.target.value })}
              placeholder="Например: Frontend Developer • React • TypeScript"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">О себе</label>
            <Textarea
              value={model.summary}
              onChange={(e) => setModel({ ...model, summary: e.target.value })}
              placeholder="Кратко расскажите о себе, своём опыте и сильных сторонах"
            />
          </div>

          <div>
            <label className="label">Уровень</label>
            <Select
              value={model.experienceLevel}
              onChange={(e) => setModel({ ...model, experienceLevel: e.target.value as ExperienceLevel | "" })}
            >
              <option value="">Не выбран</option>
              <option value="INTERN">Intern</option>
              <option value="JUNIOR">Junior</option>
              <option value="MIDDLE">Middle</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
            </Select>
          </div>

          <div>
            <label className="label">Навыки</label>
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="react, typescript, css, figma"
            />
          </div>
        </div>

        {!!skillList.length && (
          <div className="profile-skills-block">
            <div className="label">Предпросмотр навыков</div>
            <div className="badges">
              {skillList.map((skill) => (
                <span key={skill} className="badge badge-blue">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {mut.isSuccess && <div className="success-note">Профиль сохранён.</div>}
      </div>

      <aside className="profile-sidebar">
        <div className="card card-pad profile-preview-card">
          <div className="profile-avatar">{(model.fullName || me?.email || "F").trim().charAt(0).toUpperCase()}</div>
          <h2 className="h2 profile-preview-name">{model.fullName || "Ваше имя"}</h2>
          <p className="p">{model.headline || "Добавьте заголовок, чтобы профиль выглядел убедительнее."}</p>

          <div className="profile-preview-meta">
            <div>
              <span>Email</span>
              <strong>{me?.email ?? "—"}</strong>
            </div>
            <div>
              <span>Локация</span>
              <strong>{model.location || "Не указана"}</strong>
            </div>
            <div>
              <span>Уровень</span>
              <strong>{model.experienceLevel ? levelMap[model.experienceLevel] ?? model.experienceLevel : "Не выбран"}</strong>
            </div>
          </div>
        </div>

        <div className="card card-pad profile-tip-card">
          <h3 className="h2">Что стоит заполнить</h3>
          <ul className="profile-tip-list">
            <li>Понятный headline с ролью и стеком.</li>
            <li>Короткое summary на 3–5 предложений.</li>
            <li>Навыки через запятую для поиска.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
