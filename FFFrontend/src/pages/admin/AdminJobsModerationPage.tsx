import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import type { JobPost, Paged, VacancyStatus } from "../../api/types";
import "../../components/ui.css";

type ModerationTab = "PENDING" | "APPROVED" | "REJECTED";

export function AdminJobsModerationPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [status, setStatus] = useState<ModerationTab>("PENDING");

  const q = useQuery({
    queryKey: ["adminJobPosts", status],
    queryFn: () =>
      adminApi.jobsModeration(token!, `?status=${status}&page=1&pageSize=20`),
    enabled: !!token,
  });

  const action = useMutation({
    mutationFn: async ({
      jobId,
      nextStatus,
    }: {
      jobId: number;
      nextStatus: Extract<VacancyStatus, "APPROVED" | "REJECTED" | "REMOVED">;
    }) => adminApi.setJobStatus(token!, jobId, nextStatus),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["adminJobPosts", "PENDING"] }),
        qc.invalidateQueries({ queryKey: ["adminJobPosts", "APPROVED"] }),
        qc.invalidateQueries({ queryKey: ["adminJobPosts", "REJECTED"] }),
        qc.invalidateQueries({ queryKey: ["jobs"] }),
      ]);
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
    return (
      <Centered title="Ошибка">
        {(q.error as any)?.message ?? "Не удалось загрузить вакансии."}
      </Centered>
    );
  }

  const data = q.data as Paged<JobPost>;

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">Модерация вакансий</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Pending — очередь на проверку. Approved — опубликованные.
              Rejected — отклонённые.
            </p>
          </div>

          <div style={{ width: 220 }}>
            <label className="label">Раздел</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ModerationTab)}
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>
        </div>
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Пусто</h2>
          <p className="p" style={{ marginTop: 6 }}>
            В разделе {status} сейчас нет вакансий.
          </p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((j: JobPost) => (
            <div key={j.id} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>{j.title}</div>
                  <div className="small">{j.city ?? "—"}</div>

                  <div className="badges" style={{ marginTop: 8 }}>
                    <span className="badge badge-blue">{j.status}</span>
                    {j.company?.email ? (
                      <span className="badge">{j.company.email}</span>
                    ) : null}
                  </div>
                </div>

                <div className="toolbar">
                  {status !== "APPROVED" && (
                    <Button
                      disabled={action.isPending}
                      onClick={() =>
                        action.mutate({
                          jobId: j.id,
                          nextStatus: "APPROVED",
                        })
                      }
                    >
                      Approve
                    </Button>
                  )}

                  {status !== "REJECTED" && (
                    <Button
                      disabled={action.isPending}
                      onClick={() =>
                        action.mutate({
                          jobId: j.id,
                          nextStatus: "REJECTED",
                        })
                      }
                    >
                      Reject
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    disabled={action.isPending}
                    onClick={() =>
                      action.mutate({
                        jobId: j.id,
                        nextStatus: "REMOVED",
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="p" style={{ marginTop: 10 }}>
                {(j.description ?? "").slice(0, 220)}
                {(j.description ?? "").length > 220 ? "…" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}