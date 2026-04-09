import { useParams } from "react-router-dom";

export default function PublicResumeDetailPage() {
  const { resumeId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Резюме #{resumeId}</h1>
        <p className="text-sm text-slate-500">
          Публичная страница резюме.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <p className="text-slate-600">Следующим шагом подключим реальный API и просмотр PDF.</p>
      </div>
    </div>
  );
}