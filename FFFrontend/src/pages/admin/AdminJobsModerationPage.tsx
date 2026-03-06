import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import "../../components/ui.css";

export function AdminJobsModerationPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [status, setStatus] = useState("PENDING");

  const q = useQuery({
    queryKey: ["adminJobPosts", status],
    queryFn: () => adminApi.pendingJobs(token!, status),
    enabled: !!token
  });

  const action = useMutation({
    mutationFn: async ({ jobId, op }: { jobId: string; op: "approve" | "reject" | "remove" }) => {
      if (op === "approve") return adminApi.approveJob(token!, jobId);
      if (op === "reject") return adminApi.rejectJob(token!, jobId);
      return adminApi.removeJob(token!, jobId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminJobPosts", status] })
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить вакансии."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">Модерация вакансий</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Публично показываются только <b>APPROVED</b>.
            </p>
          </div>
          <div style={{ width: 220 }}>
            <label className="label">Статус</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="REMOVED">REMOVED</option>
            </Select>
          </div>
        </div>
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Очередь пуста</h2>
          <p className="p" style={{ marginTop: 6 }}>Нет вакансий со статусом {status}.</p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((j) => (
            <div key={j.id} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>{j.title}</div>
                  <div className="small">{j.location}</div>
                  <div className="badges" style={{ marginTop: 8 }}>
                    <span className="badge badge-blue">{j.status}</span>
                    {j.company?.companyName ? <span className="badge">{j.company.companyName}</span> : null}
                  </div>
                </div>
                <div className="toolbar">
                  <Button disabled={action.isPending} onClick={() => action.mutate({ jobId: j.id, op: "approve" })}>Approve</Button>
                  <Button disabled={action.isPending} onClick={() => action.mutate({ jobId: j.id, op: "reject" })}>Reject</Button>
                  <Button variant="danger" disabled={action.isPending} onClick={() => action.mutate({ jobId: j.id, op: "remove" })}>Remove</Button>
                </div>
              </div>
              <div className="p" style={{ marginTop: 10 }}>
                {(j.description ?? "").slice(0, 220)}{(j.description ?? "").length > 220 ? "…" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
