import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { messagingApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "../../components/Button";
import "../../components/ui.css";

type CandidateStage =
  | "UNDER_REVIEW"
  | "INVITED_TO_INTERVIEW"
  | "INTERVIEWED"
  | "HIRED"
  | "REJECTED";

type CompanyCandidate = {
  id: number;
  candidateStage: CandidateStage | null;
  updatedAt?: string;
  companyEngagedAt?: string | null;

  seekerProfile: {
    id: number;
    firstName: string;
    lastName: string | null;
    headline: string | null;
    location?: string | null;
  };

  vacancy: {
    id: number;
    title: string;
  };

  messages?: {
    body: string;
    createdAt: string;
  }[];
};

const STAGES: { value: CandidateStage; label: string }[] = [
  { value: "UNDER_REVIEW", label: "На рассмотрении" },
  { value: "INVITED_TO_INTERVIEW", label: "Приглашён на интервью" },
  { value: "INTERVIEWED", label: "Проинтервьюирован" },
  { value: "HIRED", label: "Нанят" },
  { value: "REJECTED", label: "Отклонён" },
];

const FILTERS: { value: "ALL" | CandidateStage; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "UNDER_REVIEW", label: "На рассмотрении" },
  { value: "INVITED_TO_INTERVIEW", label: "Приглашены" },
  { value: "INTERVIEWED", label: "Проинтервьюированы" },
  { value: "HIRED", label: "Наняты" },
  { value: "REJECTED", label: "Отклонённые" },
];

function getStageLabel(stage: CandidateStage | null | undefined) {
  return (
    STAGES.find((s) => s.value === stage)?.label ?? "На рассмотрении"
  );
}

function getStageTone(stage: CandidateStage | null | undefined) {
  switch (stage) {
    case "HIRED":
      return {
        background: "#ecfdf5",
        color: "#166534",
        border: "1px solid #bbf7d0",
      };
    case "REJECTED":
      return {
        background: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
      };
    case "INVITED_TO_INTERVIEW":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      };
    case "INTERVIEWED":
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fed7aa",
      };
    case "UNDER_REVIEW":
    default:
      return {
        background: "#f8fafc",
        color: "#334155",
        border: "1px solid #cbd5e1",
      };
  }
}

function formatName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Кандидат";
}

function formatTime(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function getInitials(firstName?: string | null, lastName?: string | null) {
  const a = firstName?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "C";
}

export function CompanyCandidatesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();

  const [statusFilter, setStatusFilter] = useState<"ALL" | CandidateStage>("ALL");
  const [query, setQuery] = useState("");

  const q = useQuery<CompanyCandidate[]>({
    queryKey: ["company-candidates"],
    queryFn: () => messagingApi.companyCandidates(token!) as Promise<CompanyCandidate[]>,
    enabled: !!token,
  });

  const updateStage = useMutation({
    mutationFn: ({
      threadId,
      stage,
    }: {
      threadId: number;
      stage: CandidateStage;
    }) => messagingApi.updateStage(token!, threadId, stage),

    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["company-candidates"] });
      await qc.invalidateQueries({ queryKey: ["threads"] });
      await qc.invalidateQueries({ queryKey: ["chat-sidebar", "all"] });
    },
  });

  const items = q.data ?? [];

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    return items.filter((item) => {
      const stage = item.candidateStage ?? "UNDER_REVIEW";

      const matchesStatus =
        statusFilter === "ALL" ? true : stage === statusFilter;

      const name = formatName(
        item.seekerProfile?.firstName,
        item.seekerProfile?.lastName
      ).toLowerCase();

      const headline = (item.seekerProfile?.headline ?? "").toLowerCase();
      const location = (item.seekerProfile?.location ?? "").toLowerCase();
      const vacancy = (item.vacancy?.title ?? "").toLowerCase();
      const lastMessage = (item.messages?.[0]?.body ?? "").toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        headline.includes(search) ||
        location.includes(search) ||
        vacancy.includes(search) ||
        lastMessage.includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [items, statusFilter, query]);

  const stats = useMemo(() => {
    const base = {
      ALL: items.length,
      UNDER_REVIEW: 0,
      INVITED_TO_INTERVIEW: 0,
      INTERVIEWED: 0,
      HIRED: 0,
      REJECTED: 0,
    } as Record<"ALL" | CandidateStage, number>;

    for (const item of items) {
      const stage = item.candidateStage ?? "UNDER_REVIEW";
      base[stage] += 1;
    }

    return base;
  }, [items]);

  if (q.isLoading) {
    return (
      <div className="grid" style={{ gap: 14 }}>
        <div className="surface card-pad">
          <h1 className="h1">Кандидаты</h1>
          <p className="p" style={{ marginTop: 6 }}>
            Загрузка кандидатов...
          </p>
        </div>
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="grid" style={{ gap: 14 }}>
        <div className="surface card-pad">
          <h1 className="h1">Кандидаты</h1>
          <p className="p" style={{ marginTop: 6 }}>
            Не удалось загрузить кандидатов.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 260 }}>
            <h1 className="h1">Кандидаты</h1>
            <p className="p" style={{ marginTop: 8, maxWidth: 760 }}>
              Здесь собраны кандидаты, с которыми компания уже вступила в диалог:
            </p>
          </div>

          <div className="badges">
            <span className="badge badge-blue">Всего: {stats.ALL}</span>
            <span className="badge">На рассмотрении: {stats.UNDER_REVIEW}</span>
            <span className="badge">Приглашены: {stats.INVITED_TO_INTERVIEW}</span>
            <span className="badge">Проинтервьюированы: {stats.INTERVIEWED}</span>
            <span className="badge badge-green">Наняты: {stats.HIRED}</span>
          </div>
        </div>
      </div>

      <div className="surface card-pad">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) auto",
            gap: 12,
            alignItems: "center",
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени, вакансии, позиции, городу..."
            className="input"
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            {FILTERS.map((filter) => {
              const active = statusFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  style={{
                    border: active ? "1px solid #4f6ef7" : "1px solid #dbe3ef",
                    background: active ? "#4f6ef7" : "#ffffff",
                    color: active ? "#ffffff" : "#1e293b",
                    borderRadius: 999,
                    padding: "8px 12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "0.15s ease",
                  }}
                >
                  {filter.label} ({stats[filter.value] ?? 0})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Ничего не найдено</h2>
          <p className="p" style={{ marginTop: 8 }}>
            Попробуй поменять фильтр или очистить поиск.
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gap: 14 }}>
          {filteredItems.map((t) => {
            const seeker = t.seekerProfile;
            const vacancy = t.vacancy;
            const currentStage = t.candidateStage ?? "UNDER_REVIEW";
            const currentStageTone = getStageTone(currentStage);
            const lastMessage = t.messages?.[0];
            const fullName = formatName(seeker.firstName, seeker.lastName);

            return (
              <div
                key={t.id}
                className="card card-pad"
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px minmax(0, 1fr) auto",
                    gap: 14,
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    {getInitials(seeker.firstName, seeker.lastName)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          lineHeight: 1.1,
                        }}
                      >
                        {fullName}
                      </div>

                      <span
                        style={{
                          ...currentStageTone,
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {getStageLabel(currentStage)}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 15,
                        color: "#334155",
                        fontWeight: 700,
                      }}
                    >
                      {seeker.headline ?? "Позиция не указана"}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {seeker.location && (
                        <span className="badge">{seeker.location}</span>
                      )}
                      <span className="badge badge-blue">
                        Вакансия: {vacancy.title}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={() => nav(`/inbox/${t.id}`)}
                    >
                      Открыть чат
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    borderRadius: 16,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: 6,
                    }}
                  >
                    Последнее сообщение
                  </div>

                  {lastMessage ? (
                    <>
                      <div
                        style={{
                          color: "#0f172a",
                          lineHeight: 1.45,
                          wordBreak: "break-word",
                        }}
                      >
                        {lastMessage.body}
                      </div>
                      <div className="small" style={{ marginTop: 8 }}>
                        {formatTime(lastMessage.createdAt)}
                      </div>
                    </>
                  ) : (
                    <div className="small">Сообщений пока нет.</div>
                  )}
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#475569",
                    }}
                  >
                    Сменить этап кандидата
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {STAGES.map((s) => {
                      const active = currentStage === s.value;
                      const loading =
                        updateStage.isPending &&
                        updateStage.variables?.threadId === t.id &&
                        updateStage.variables?.stage === s.value;

                      return (
                        <button
                          key={s.value}
                          type="button"
                          disabled={active || loading}
                          onClick={() =>
                            updateStage.mutate({
                              threadId: t.id,
                              stage: s.value,
                            })
                          }
                          style={{
                            border: active
                              ? "1px solid #4f6ef7"
                              : "1px solid #dbe3ef",
                            background: active ? "#eef2ff" : "#ffffff",
                            color: active ? "#2847d9" : "#1e293b",
                            borderRadius: 12,
                            padding: "10px 12px",
                            fontWeight: 800,
                            cursor: active ? "default" : "pointer",
                            opacity: loading ? 0.7 : 1,
                          }}
                        >
                          {loading ? "Сохраняю..." : s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}