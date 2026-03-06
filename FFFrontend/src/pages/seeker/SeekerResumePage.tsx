import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { seekerApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import "../../components/ui.css";

const defaultResume = {
  summary: "",
  experience: [
    { company: "", title: "", start: "", end: "", bullets: [""] }
  ],
  education: [
    { school: "", degree: "", year: "" }
  ],
  projects: [
    { name: "", link: "", description: "" }
  ]
};

export function SeekerResumePage() {
  const { token } = useAuth();
  const q = useQuery({
    queryKey: ["seekerResume"],
    queryFn: () => seekerApi.getResume(token!),
    enabled: !!token
  });

  const fileQ = useQuery({
    queryKey: ["resumeFileMeta"],
    queryFn: () => seekerApi.getResumeFileMeta(token!),
    enabled: !!token
  });

  const [jsonText, setJsonText] = useState<string>(JSON.stringify(defaultResume, null, 2));
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (q.data?.dataJson) setJsonText(JSON.stringify(q.data.dataJson, null, 2));
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const parsed = JSON.parse(jsonText);
      return seekerApi.putResume(token!, { dataJson: parsed });
    },
    onSuccess: () => setMsg("Резюме сохранено."),
    onError: (e: any) => setMsg(e?.message ?? "Не удалось сохранить.")
  });

  const uploadMut = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Выберите файл");
      return seekerApi.uploadResumeFile(token!, file);
    },
    onSuccess: () => {
      setMsg("Файл загружен (метаданные обновятся после перезагрузки страницы).");
      fileQ.refetch();
    },
    onError: (e: any) => setMsg(e?.message ?? "Не удалось загрузить файл.")
  });

  const deleteMut = useMutation({
    mutationFn: async () => seekerApi.deleteResumeFile(token!),
    onSuccess: () => {
      setMsg("Файл удалён.");
      fileQ.refetch();
    },
    onError: (e: any) => setMsg(e?.message ?? "Не удалось удалить файл.")
  });

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить резюме."}</Centered>;

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">Резюме (структурированное)</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Для MVP — редактирование JSON. Компания видит только структурированное резюме.
              Скачивание файла резюме доступно только администратору.
            </p>
          </div>
          <div className="toolbar">
            <Button variant="primary" disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>
              {saveMut.isPending ? "Сохранение…" : "Сохранить JSON"}
            </Button>
          </div>
        </div>

        <div className="hr" style={{ margin: "14px 0" }} />

        <label className="label">dataJson</label>
        <textarea
          className="textarea"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}
        />

        <div className="hr" style={{ margin: "14px 0" }} />

        <h2 className="h2">Файл резюме (PDF/DOC/DOCX)</h2>
        <p className="p" style={{ marginTop: 6 }}>
          Здесь только загрузка/замена/удаление и метаданные. Кнопки скачивания нет по требованиям ТЗ.
        </p>

        <div className="grid" style={{ marginTop: 10 }}>
          <div className="surface" style={{ padding: 12 }}>
            <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>Метаданные</div>
            {fileQ.isLoading ? <Spinner /> : fileQ.isError ? (
              <div className="small">Файл ещё не загружен (или сервер вернул ошибку).</div>
            ) : (
              <div className="kv">
                <span><b>{fileQ.data.filename}</b></span>
                <span>{fileQ.data.mimeType}</span>
                <span>{Math.round(fileQ.data.sizeBytes / 1024)} KB</span>
                <span>{new Date(fileQ.data.uploadedAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="toolbar">
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button variant="primary" disabled={uploadMut.isPending || !file} onClick={() => uploadMut.mutate()}>
              {uploadMut.isPending ? "Загрузка…" : "Загрузить/Заменить"}
            </Button>
            <Button variant="danger" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate()}>
              {deleteMut.isPending ? "Удаление…" : "Удалить файл"}
            </Button>
          </div>
        </div>

        {msg && <div className="small" style={{ marginTop: 10, fontWeight: 800 }}>{msg}</div>}
      </div>
    </div>
  );
}
