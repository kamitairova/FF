import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { messagingApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import type { MessagingThread } from "../../api/types";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Button } from "../../components/Button";
import "../../components/ui.css";

function getThreadTitle(thread: MessagingThread, role?: string) {
  if (role === "COMPANY") {
    const first = thread.seekerProfile?.firstName ?? "";
    const last = thread.seekerProfile?.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || "Соискатель";
  }

  return thread.companyProfile?.companyName?.trim() || "Компания";
}

function formatMessageTime(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function getProfilePath(thread: MessagingThread, role?: string) {
  if (role === "COMPANY" && thread.seekerProfile?.id) {
    return `/seekers/${thread.seekerProfile.id}`;
  }

  if (role === "USER" && thread.companyProfile?.id) {
    return `/companies/${thread.companyProfile.id}`;
  }

  return null;
}

export function ThreadPage() {
  const { threadId } = useParams();
  const { token, me } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const idNum = Number(threadId);

  const q = useQuery<MessagingThread>({
    queryKey: ["thread", idNum],
    queryFn: () => messagingApi.threadById(token!, idNum),
    enabled: !!token && Number.isFinite(idNum),
    refetchInterval: 5000,
  });

  const sendMut = useMutation({
    mutationFn: () => messagingApi.sendMessage(token!, idNum, text.trim()),
    onSuccess: async () => {
      setText("");
      await qc.invalidateQueries({ queryKey: ["thread", idNum] });
      await qc.invalidateQueries({ queryKey: ["threads"] });
      await qc.invalidateQueries({ queryKey: ["company-candidates"] });
      await qc.invalidateQueries({ queryKey: ["seeker-applications"] });
      await qc.invalidateQueries({ queryKey: ["chat-sidebar", "all"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => messagingApi.deleteForMe(token!, idNum),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["thread", idNum] });
      await qc.invalidateQueries({ queryKey: ["threads"] });
      await qc.invalidateQueries({ queryKey: ["company-candidates"] });
      await qc.invalidateQueries({ queryKey: ["seeker-applications"] });
      await qc.invalidateQueries({ queryKey: ["chat-sidebar", "all"] });
      nav("/inbox");
    },
  });

  const thread = q.data;
  const messages = useMemo(() => thread?.messages ?? [], [thread?.messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (q.isLoading) {
    return (
      <Centered>
        <Spinner />
      </Centered>
    );
  }

  if (q.isError || !thread) {
    return (
      <Centered title="Ошибка">
        {(q.error as any)?.message ?? "Не удалось загрузить чат."}
      </Centered>
    );
  }

  const title = getThreadTitle(thread, me?.role);
  const profilePath = getProfilePath(thread, me?.role);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 80px)",
        minHeight: 0,
        gap: 14,
      }}
    >
      <div className="surface card-pad">
        <div
          className="split"
          style={{ alignItems: "flex-start", gap: 12 }}
        >
          <div>
            {profilePath ? (
              <Link
                to={profilePath}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <h1
                  className="h1"
                  style={{
                    marginBottom: 6,
                    cursor: "pointer",
                  }}
                >
                  {title}
                </h1>
              </Link>
            ) : (
              <h1 className="h1" style={{ marginBottom: 6 }}>
                {title}
              </h1>
            )}

            {thread.vacancy?.title && (
              <div className="small">Вакансия: {thread.vacancy.title}</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {profilePath && (
              <Link to={profilePath} style={{ textDecoration: "none" }}>
                <Button variant="default">Открыть профиль</Button>
              </Link>
            )}

            <Button
              variant="default"
              disabled={deleteMut.isPending}
              onClick={() => deleteMut.mutate()}
            >
              {deleteMut.isPending ? "Удаление..." : "Удалить чат"}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="card card-pad"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingRight: 4,
          }}
        >
          {messages.length === 0 ? (
            <div className="small">Сообщений пока нет</div>
          ) : (
            messages.map((m) => {
              const mine = Number(me?.id) === Number(m.senderUserId);

              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: mine ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "72%",
                      padding: "10px 12px",
                      borderRadius: 16,
                      background: mine ? "#4f6ef7" : "#eef2f7",
                      color: mine ? "#ffffff" : "#0f172a",
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
                      wordBreak: "break-word",
                    }}
                  >
                    <div style={{ fontSize: 15, lineHeight: 1.45 }}>{m.body}</div>

                    <div
                      style={{
                        fontSize: 11,
                        marginTop: 6,
                        opacity: mine ? 0.9 : 0.65,
                        textAlign: "right",
                      }}
                    >
                      {formatMessageTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div
        className="surface card-pad"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && text.trim() && !sendMut.isPending) {
                e.preventDefault();
                sendMut.mutate();
              }
            }}
            placeholder="Введите сообщение"
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              padding: "0 14px",
              fontSize: 15,
              outline: "none",
            }}
          />

          <Button
            variant="primary"
            disabled={!text.trim() || sendMut.isPending}
            onClick={() => sendMut.mutate()}
          >
            {sendMut.isPending ? "Отправка..." : "Отправить"}
          </Button>
        </div>
      </div>
    </div>
  );
}