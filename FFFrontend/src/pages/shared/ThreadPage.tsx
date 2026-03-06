import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { useParams, Link } from "react-router-dom";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import { Textarea } from "../../components/Textarea";
import "../../components/ui.css";

export function ThreadPage() {
  const { token, me } = useAuth();
  const { threadId } = useParams();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  const qs = useMemo(() => `?page=1&pageSize=200`, []);

  const q = useQuery({
    queryKey: ["messages", threadId, qs],
    queryFn: () => messagingApi.messages(token!, threadId!, qs),
    enabled: !!token && !!threadId
  });

  const send = useMutation({
    mutationFn: async () => messagingApi.send(token!, threadId!, { body: body.trim() }),
    onSuccess: () => {
      setBody("");
      setInfo(null);
      qc.invalidateQueries({ queryKey: ["messages", threadId, qs] });
    },
    onError: (e: any) => setInfo(e?.message ?? "Не удалось отправить сообщение.")
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить сообщения."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <div className="small" style={{ fontWeight: 900 }}>
              <Link to="/inbox">Сообщения</Link> <span style={{ opacity: 0.6 }}> / </span> #{threadId?.slice(0, 8)}
            </div>
            <h1 className="h1" style={{ marginTop: 8 }}>Диалог</h1>
          </div>
          <div className="badge badge-blue">{me?.role ?? ""}</div>
        </div>
      </div>

      <div className="card card-pad">
        {data.data.length === 0 ? (
          <div className="p">Сообщений пока нет.</div>
        ) : (
          <div className="grid" style={{ gap: 10 }}>
            {data.data.map((m) => (
              <div key={m.id} className="surface" style={{ padding: 12 }}>
                <div className="small" style={{ fontWeight: 900 }}>
                  {m.senderUserId === me?.id ? "Вы" : "Собеседник"} · {new Date(m.createdAt).toLocaleString()}
                </div>
                <div style={{ whiteSpace: "pre-wrap", marginTop: 6, lineHeight: 1.5 }}>{m.body}</div>
              </div>
            ))}
          </div>
        )}

        <div className="hr" style={{ margin: "14px 0" }} />

        <label className="label">Новое сообщение</label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Напишите сообщение…" />
        <div className="toolbar" style={{ marginTop: 10 }}>
          <Button
            variant="primary"
            disabled={send.isPending || body.trim().length === 0}
            onClick={() => send.mutate()}
          >
            {send.isPending ? "Отправка…" : "Отправить"}
          </Button>
          {info && <div className="small" style={{ fontWeight: 800 }}>{info}</div>}
        </div>
      </div>
    </div>
  );
}
