import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { candidatesApi, messagingApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import "../../components/ui.css";

export function CandidateDetailPage() {
  const { token } = useAuth();
  const nav = useNavigate();
  const { seekerProfileId } = useParams();
  const [info, setInfo] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["candidate", seekerProfileId],
    queryFn: () => candidatesApi.detail(token!, seekerProfileId!),
    enabled: !!token && !!seekerProfileId
  });

  const threadMut = useMutation({
    mutationFn: async () => messagingApi.createThread(token!, { seekerProfileId }),
    onSuccess: (t) => nav(`/inbox/${t.id}`),
    onError: (e: any) => setInfo(e?.message ?? "Не удалось открыть чат.")
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить кандидата."}</Centered>;

  const d = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">{d.profile.fullName}</h1>
            <div className="kv" style={{ marginTop: 8 }}>
              <span><b>{d.profile.location}</b></span>
              <span>{d.profile.experienceLevel ?? "—"}</span>
              <span>{d.profile.headline}</span>
            </div>
          </div>
          <div className="toolbar">
            <Button onClick={() => nav(-1 as any)}>Назад</Button>
            <Button variant="primary" disabled={threadMut.isPending} onClick={() => threadMut.mutate()}>
              {threadMut.isPending ? "Открываем…" : "Написать"}
            </Button>
          </div>
        </div>

        <div className="badges" style={{ marginTop: 12 }}>
          {(d.profile.skills ?? []).map((s) => <span key={s} className="badge">{s}</span>)}
        </div>

        {d.profile.summary && (
          <>
            <div className="hr" style={{ margin: "14px 0" }} />
            <h2 className="h2">О себе</h2>
            <div className="p" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{d.profile.summary}</div>
          </>
        )}

        <div className="hr" style={{ margin: "14px 0" }} />
        <h2 className="h2">Структурированное резюме</h2>
        <div className="small" style={{ marginTop: 6 }}>
          Файл резюме (PDF/DOC) здесь не доступен по ТЗ — только structured resume.
        </div>
        <pre style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "#0b1220",
          color: "#e5e7eb",
          overflow: "auto"
        }}>
{JSON.stringify(d.resume?.dataJson ?? null, null, 2)}
        </pre>

        {info && <div className="small" style={{ marginTop: 10, fontWeight: 800 }}>{info}</div>}
      </div>
    </div>
  );
}
