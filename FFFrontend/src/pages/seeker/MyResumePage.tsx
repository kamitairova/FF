import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumesApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router-dom";
import "../../components/ui.css";

type ResumeItem = {
  id: number;
  title: string;
  desiredPosition?: string | null;
  salaryExpectation?: number | null;
  experienceLevel?: string | null;
  skills?: string[];
  isPublic: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  createdAt: string;
  updatedAt: string;
  resumeFile?: {
    id: number;
    fileName: string;
    url?: string;
  } | null;
};

function getStatusLabel(status: string) {
  if (status === "PENDING") return "На модерации";
  if (status === "APPROVED") return "Одобрено";
  if (status === "REJECTED") return "Отклонено";
  return status;
}

export function MyResumesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();

  const q = useQuery({
    queryKey: ["myResumes"],
    queryFn: () => resumesApi.mine(token!),
    enabled: !!token,
  });

  const del = useMutation({
    mutationFn: (resumeId: number) => resumesApi.delete(token!, resumeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myResumes"] }),
  });

  if (q.isLoading) {
    return (
      <Centered>
        <Spinner />
      </Centered>
    );
  }

  if (q.isError) {
    return (
      <Centered title="Ошибка">
        {(q.error as any)?.message ?? "Не удалось загрузить резюме."}
      </Centered>
    );
  }

  const data = q.data as { data: ResumeItem[] } | undefined;
  const items = data?.data ?? [];

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">Мои резюме</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Здесь отображаются все ваши резюме с любым статусом.
            </p>
          </div>

          <Button variant="primary" onClick={() => nav("/seeker/resumes/new")}>
            Создать резюме
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пока нет резюме</h2>
          <p className="p" style={{ marginTop: 6 }}>
            Создайте первое резюме.
          </p>
        </div>
      ) : (
        <div className="grid">
          {items.map((resume) => (
            <div
              key={resume.id}
              className="card card-pad"
              style={{ cursor: "pointer" }}
              onClick={() => nav(`/seeker/resumes/${resume.id}`)}
            >
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {resume.desiredPosition || resume.title}
                  </div>

                  <div className="small">{resume.title}</div>

                  <div className="badges" style={{ marginTop: 8 }}>
                    <span className="badge badge-blue">
                      {getStatusLabel(resume.status)}
                    </span>

                    {resume.experienceLevel ? (
                      <span className="badge">{resume.experienceLevel}</span>
                    ) : null}

                    {typeof resume.salaryExpectation === "number" ? (
                      <span className="badge">{resume.salaryExpectation} сом</span>
                    ) : null}
                  </div>
                </div>

                <div className="toolbar" onClick={(e) => e.stopPropagation()}>
                  <Button onClick={() => nav(`/seeker/resumes/${resume.id}`)}>
                    Открыть
                  </Button>

                  <Button onClick={() => nav(`/seeker/resumes/${resume.id}/edit`)}>
                    Редактировать
                  </Button>

                  <Button
                    variant="danger"
                    disabled={del.isPending}
                    onClick={() => del.mutate(resume.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}