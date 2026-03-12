import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import "../../components/ui.css";

export function AdminUsersPage() {
  const { token } = useAuth();
  const [userId, setUserId] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  const disable = useMutation({
  mutationFn: async () => adminApi.disableUser(token!, Number(userId.trim())),
  onSuccess: () => setInfo("Пользователь отключён."),
  onError: (e: any) => setInfo(e?.message ?? "Не удалось отключить.")
  });

  const enable = useMutation({
  mutationFn: async () => adminApi.enableUser(token!, Number(userId.trim())),
  onSuccess: () => setInfo("Пользователь включён."),
  onError: (e: any) => setInfo(e?.message ?? "Не удалось включить.")
  });

  const parsedUserId = Number(userId.trim());
  const invalid = !userId.trim() || Number.isNaN(parsedUserId);
  

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Пользователи: enable/disable</h1>
        <p className="p" style={{ marginTop: 6 }}>
          По ТЗ доступны только эндпоинты enable/disable. 
          Поэтому здесь вводится <b>userId</b> вручную (например, из логов/админки бэка).
        </p>
      </div>

      <div className="card card-pad">
        <label className="label">User ID</label>
        <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="uuid" />
        <div className="toolbar" style={{ marginTop: 10 }}>
          <Button variant="danger" disabled={!userId.trim() || disable.isPending} onClick={() => disable.mutate()}>
            {disable.isPending ? "…" : "Disable"}
          </Button>
          <Button disabled={!userId.trim() || enable.isPending} onClick={() => enable.mutate()}>
            {enable.isPending ? "…" : "Enable"}
          </Button>
          {info && <div className="small" style={{ fontWeight: 800 }}>{info}</div>}
        </div>
      </div>
    </div>
  );
}
